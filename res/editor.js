/*
	AdScriptor
    Copyright (c) 2016 crealytics GmbH All Rights Reserved.
    See LICENSE.md for License Information.
*/
/*
    Contains the Interaction Code for the Ace Editor.
*/

/* The only Editor Instance */
var theEditor = new AceEditor();

function AceEditor() {
    /* Private Functions */

    /* Creates a new Ace Session with a set text content */
    function newAceSession(text) {
        var session = ace.createEditSession(text, "ace/mode/javascript");
        session.session = session; // Add a property session to the session that points to itself (needed for tern, because tern espects the Editor Object instead of a Session)
        session.selection.on('changeCursor', function () { theEditor.editor.ternServer.updateArgHints(theEditor.editor); }); // tern Autocompletion only works if this is set...
        return session;
    }

    /* Creates a Tab for a File that's displayed above the Editor */
    function newFileTab(name, id) {
        var tab = $("<div>" + name + "</div>");
        $("div#editor_file_tabs").append(tab); // Append it to the DOM
        // If the Tab is clicked, switch to it and focus the Editor
        tab.click(function () {
            theEditor.setActiveTab(id);
            theEditor.editor.focus();
        });
        return tab;
    }

    /* Creates the Ace Editor, the optional callback is invoked once the Editor is fully initialized */
    function CreateEditor(callback) {
        // Create the Editor with some aliases
        var editor = theEditor.editor = window.editor = ace.edit("editor");

        // Safe the default session
        this.defaultSession = editor.getSession();
        this.defaultSession.session = this.defaultSession; // same as in newAceSession(), needed for autocompletion to work.

        // set some defaults
        editor.getSession().setUseWrapMode(false);
        editor.getSession().setWrapLimitRange(null, null);
        editor.setShowPrintMargin(false);
        editor.$blockScrolling = Infinity; //prevents ace from logging annoying warnings

        // set parameters for the default session
        editor.getSession().setUseWorker(true);
        editor.session.setMode("ace/mode/javascript");

        // load the theme if the User has a custom one selected, otherwise load the default.
        var theme = Store.getItem("theme.txt");
        if (typeof (theme) === "string" && theme !== null)
            editor.setTheme(theme);
        else
            editor.setTheme("ace/theme/solarized_dark");

        // Add the Save Command
        editor.commands.addCommand({
            name: "SaveGist",
            bindKey: { win: "Ctrl-S", mac: "Command-S" },
            exec: function () { if (gisty.getCurrentGist() !== null) gisty.saveGist(); }
        });

        // resize the editor with it's parent (needed because the ace editor doesn't resize itself automatically...)
        $("div#editor_base").on('_splitpaneparentresize', function () { editor.resize(); });

        // init tern
        ace.config.loadModule('ace/ext/language_tools', function () {
            ace.config.loadModule('ace/ext/tern', function () {
                initTern(editor, callback);
            }); // load tern end
        }); // load language tools end

        initBeautify(editor);
    }

    /* Initializes Tern */
    function initTernInternal(editor, adwords_apidef, callback) {
        // enable tern
        editor.setOptions({
            enableTern: true,
            // ternLocalStringMinLength:3,
            enableSnippets: false,
            enableBasicAutocompletion: false
        });

        //setup server options
        var server = editor.ternServer;
        server.options.defs = ['ecma5', adwords_apidef];
        server.options.plugins = { doc_comment: { fullDocs: true } };
        server.options.useWorker = true;
        server.options.switchToDoc = function (name, start, end, doNotCloseTips) {
            // search the needed doc in the doc array
            var doc = null, idx = 0;
            for (var i = 0; i < theEditor.docs.length; ++i) {
                if (theEditor.docs[i].name == name) {
                    idx = i;
                    doc = theEditor.docs[i].session;
                    break;
                }
            }
            // if it isn't in the doc array, maybe it's a dependency -> open dependency url in new tab
            if (doc === null) {
                for (var i = 0; i < theEditor.depencies.length; ++i) {
                    if (theEditor.depencies[i].name == name) {
                        var win = window.open(theEditor.depencies[i].url, '_blank');
                        win.focus();
                        return;
                    }
                }
                return;
            }
            // Activate the Tab
            theEditor.setActiveTab(idx, doNotCloseTips);
            // Jump to Position if specified
            if (start) {
                // make sure the Editor has time to perform the session switch
                setTimeout(function () {
                    theEditor.editor.gotoLine(start.row, start.column || 0); //this will make sure that the line is expanded
                    if (end) {
                        var sel = doc.getSelection();
                        sel.setSelectionRange({ start: start, end: end });
                    }
                }, 10);
            }
        };
        server.restart(); //(needed to update options)
        if (callback)
            callback(); // call user callback if defined
    }

    /* Starts the tern Initialization */
    function initTern(editor, callback) {
        /* Load our Adwords API Definition File */
        $.ajax({
            url: 'res/AdWordsApi.json',
            type: 'GET',
            dataType: 'text'
        }).success(function (adwords_api) {
            // Parse the definition and feed it to tern
            var def = JSON.parse(adwords_api);
            initTernInternal(editor, def, callback);
        }).error(function (e) {
            LogErrorOverlay("Failed to get AdWordsAPI.json", "A XHTTPRequest to get a Resource has failed.", JSON.stringify(e, null, 2));
        });
    }

    /* initializes Beautify */
    function initBeautify(editor) {
        // load the beautify module
        ace.config.loadModule('ace/ext/html_beautify', function (beautify) {
            editor.setOptions({
                // beautify when closing bracket typed in javascript or css mode
                autoBeautify: true,
                // this enables the plugin to work with hotkeys (ctrl+b to beautify)
                htmlBeautify: true,
            });
        });
    }


    /* All Members are public to ease Data Exchange with Handlers. */

    this.visible = false; // if the Ace Editor is currently visible
    this.docs = []; // the documents currently loaded (array of {name: "SomeFile.js", session: (Ace Editor Session), sel_elem: (The HTML DOM Tab Element)})
    this.depencies = []; // the currently loaded dependencies (array of {name: "underscore.js" url:"http://underscore.com/raw/"})
    this.defaultSession = null; // the default session (is restored whenever the editor is faded out)
    this.editor = null; // the reference the the ace editor


    /* Initializes the Editor */
    this.init = function (callback) {
        // The Editor is hidden by default
        $("pre#editor").css("display", "none");
        // Create the Editor
        CreateEditor(callback);
        $("pre#editor").contextMenu("div#editor_contextmenu"); // setup our custom context menu
    };

    /* Changes the Editor Theme. themename must be in the form 'ace/theme/THEME_NAME' */
    this.setTheme = function (themename) { this.editor.setTheme(themename); };

    /* Sets the active tab (i is the index in the document array, doNotCloseTips is optional and prevents Tooltips from closing when switching Sessions if its true) */
    this.setActiveTab = function (i, doNotCloseTips) {
        // Activate the Tab
        var data = this.docs[i];
        $("div#editor_file_tabs div").removeClass("active_tab");
        data.sel_elem.addClass("active_tab");
        // hide all tooltips unless doNotCloseTips === true
        if (doNotCloseTips !== true && typeof(this.editor.getSession()) === "object" && this.editor.getSession() !== null && this.editor.getSession().hasOwnProperty("name"))
            this.editor.ternServer.hideDoc(this.editor.getSession().name);
        // change the editor session to the tabs session
        this.editor.setSession(data.session);
        this.editor.focus();
    };

    /* Loads the Specified Documents
        docs is an array of {name: "Sample.js", content: "function foo() { Logger.log('hi'); }"}
        dependencies is an array of {name: "underscore.js", url: "http://foobar.de", content: "function foo() {}"}
    */
    this.loadDocs = function (docs, depencies) {
        // If the Editor is currently visible, hide it first
        if (this.visible) this.unloadDocs();
        this.visible = true;
        // Load all Documents
        for (var i = 0; i < docs.length; ++i) {
            var doc = {
                name: docs[i].name,
                session: newAceSession(docs[i].content),
                sel_elem: newFileTab(docs[i].name, i)
            };
            this.editor.ternServer.addDoc(doc.name, doc.session);
            this.docs.push(doc);
        }
        // Load all Dependencies
        for (var j = 0; j < depencies.length; ++j) {
            // Add the Dependencies to the Editor
            this.editor.ternServer.server.addFile(depencies[j].name, depencies[j].content);
            this.depencies.push({ name: depencies[j].name, url: depencies[j].url });
        }
        // Select first File as active
        this.setActiveTab(0);
        // Make the Editor visible
        $("pre#editor").css("display", "block");
    };

    /* returns all document contents
        returns [] of { name: "foobar.js", content: "function foo(){ }"}
    */
    this.getDocs = function () {
        // get the contents of each ace session and tape it together with the file name
        var content = [];
        for (var i = 0; i < this.docs.length; ++i) {
            var elem = {
                name: this.docs[i].name,
                content: this.docs[i].session.getValue()
            };
            content.push(elem);
        }
        return content;
    };

    /* Unloads all Documents and hides the Editor */
    this.unloadDocs = function () {
        // If we aren't visible, there's nothing to do.
        if (this.visible) {
            this.visible = false;
            // Remove all Sessions from the tern Server
            for (var i = 0; i < this.docs.length; ++i) {
                this.editor.ternServer.delDoc(this.docs[i].name);
            }
            // switch back to the default editor session
            this.editor.setSession(this.defaultSession);
            this.docs = [];
            // remove all Dependencies from the tern Server
            for (var j = 0; j < this.depencies.length; ++j) {
                this.editor.ternServer.server.delFile(this.depencies[j].name);
            }
            this.depencies = [];
            // Remove all File Tabs and hide the Editor
            $("div#editor_file_tabs div").remove();
            $("pre#editor").css("display", "none");
        }
    };
}
