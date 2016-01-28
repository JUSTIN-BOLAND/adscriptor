"use strict";
/*
    AdScriptor
    Copyright (c) 2016 crealytics GmbH All Rights Reserved.
    See LICENSE.md for License Information.
*/
/*
  Main Script File, the source of it all.
*/

/*
    Main Class, controls interaction between the User, the Editor and the Gist System.
*/
function Controller() {
    // Create Components
    this.requester = new GistRequester();
    // this.editor = new Editor();

    // Output Copyright
    Logger.info("Powered by crealytics GmbH");
    Logger.info("Starting, please wait...");

    // Check which Store we are using (localStorage is permanent, cookie is semi-permanent, object is temporary)
    var store_interface = Store.interfaceName();
    if(store_interface != "localStorage")
    {
        if (store_interface == "cookie")
            Logger.verbose("localStorage is not available, falling back to cookies.");
        else
            Logger.verbose("localStorage is not available, falling back to temporary storage.");
    }
}

/*
    Called once the Page is fully loaded.
*/
Controller.prototype.init = function () {

};

// The global controller object.
var controller = null;

/*
    Executed when the DOM is ready.
*/
$(function () {
    // Create the Controller.
    controller = new Controller();
});

/*
    Executed when the complete page is fully loaded.
*/
$(window).load(function () {
    // Initialize the Controller.
    controller.init();
});

// Old Stuff
// TODO: Refractor this

/* Executed when DOM is ready */
$(function () {
    Logger.info("Powered by crealytics GmbH");
    Logger.info("Internal Startup... ");
    // initialize the Editor
    theEditor.init(function () {
        // initialize the Context Menu
        initEditorContextMenu();
        // initialize the Github Bridge
        gisty.init();
        Logger.info("Internal Startup successfully completed.");
    });

    // Create horizontal and vertical Split Panes
    $("div#subcontent").splitPane();
    $("div#topcontent").splitPane();
    
    Logger.debug("DEBUG MESSAGE");
    Logger.verbose("VERBOSE MESSAGE");
    Logger.info("INFO MESSAGE");
    Logger.warning("WARNING MESSAGE");
    Logger.error("ERROR MESSAGE");
    Logger.fatal("FATAL MESSAGE");

    // initialize all main menu entries
    initMainMenu();
});


/* initalizes the Handlers for the Main Menu */
function initMainMenu() {
    /* Initialize the Theme Entry in the Main Menu. */
    function initChangeTheme() {
        var theme_values = ["ace/theme/chrome", "ace/theme/clouds", "ace/theme/crimson_editor", "ace/theme/dawn", "ace/theme/dreamweaver",
                 "ace/theme/eclipse", "ace/theme/github", "ace/theme/iplastic", "ace/theme/solarized_light", "ace/theme/textmate",
                 "ace/theme/tomorrow", "ace/theme/xcode", "ace/theme/kuroir", "ace/theme/katzenmilch", "ace/theme/sqlserver",
                 "ace/theme/ambiance", "ace/theme/chaos", "ace/theme/clouds_midnight", "ace/theme/cobalt", "ace/theme/idle_fingers",
                 "ace/theme/kr_theme", "ace/theme/merbivore", "ace/theme/merbivore_soft", "ace/theme/mono_industrial", "ace/theme/monokai",
                 "ace/theme/pastel_on_dark", "ace/theme/solarized_dark", "ace/theme/terminal", "ace/theme/tomorrow_night", "ace/theme/tomorrow_night_blue",
                 "ace/theme/tomorrow_night_bright", "ace/theme/tomorrow_night_eighties", "ace/theme/twilight", "ace/theme/vibrant_ink"];
        var create_eventhandler = function (i) {
            return function (e) {
                if (e.which == 1) {
                    var theme_name = $("div#menu_theme_" + i.toFixed(0) + " span").text();
                    Logger.info("Changing Theme to " + theme_name);
                    theEditor.setTheme(theme_values[i]);
                    Store.setItem("theme.txt", theme_values[i]);
                    theEditor.editor.focus();
                }
            }
        };

        for (var i = 0; i < theme_values.length; ++i) {
            $("div#menu_theme_" + i.toFixed(0)).mousedown(create_eventhandler(i));
        }
    }

    /* Editor Menu */
    $("div#menu_editor_keybindings").mousedown(function (e) {
        if (e.which == 1) {
            theEditor.editor.focus();
            ace.config.loadModule("ace/ext/keybinding_menu", function (module) {
                module.init(theEditor.editor);
                theEditor.editor.showKeyboardShortcuts();
            });
        }
    });

    /* File Menu */
    $("div#menu_file_new_gist").mousedown(function (e) {
        if (e.which == 1) {
            theEditor.editor.focus();
            NewGistPrompt();
        }
    });

    $("div#menu_file_delete_gist").mousedown(function (e) {
        if (e.which == 1) {
            theEditor.editor.focus();
            DeleteGistPrompt();
        }
    });

    $("div#menu_file_new").mousedown(function (e) {
        if (e.which == 1) {
            theEditor.editor.focus();
            NewFilePrompt();
        }
    });

    $("div#menu_file_delete").mousedown(function (e) {
        if (e.which == 1) {
            theEditor.editor.focus();
            DeleteFilePrompt();
        }
    });

    $("div#menu_file_save").mousedown(function (e) {
        if (e.which == 1) {
            theEditor.editor.focus();
            gisty.saveGist();
        }
    });

    /* User Menu */
    $("div#menu_user_logoff").mousedown(function (e) {
        if (e.which == 1) {
            theEditor.editor.focus();
            Store.removeItem("token.crypt");
            location.reload();
        }
    });

    /* Gist Menu */
    $("div#menu_gist_embed").mousedown(function (e) {
        if (e.which == 1) {
            theEditor.editor.focus();
            EmbedGistPopup();
        }
    });

    $("div#menu_gist_edit_dependencies").mousedown(function (e) {
        if (e.which == 1) {
            theEditor.editor.focus();
            GistEditDependencies();
        }
    });

    $("div#menu_gist_export").mousedown(function (e) {
        if (e.which == 1) {
            theEditor.editor.focus();
            ExportGist();
        }
    });

    // initialize Theme Change Menu
    initChangeTheme();
}

/* Initializes the Editors Context Menu */
function initEditorContextMenu() {
    var commands = theEditor.editor.commands;
    var platform = commands.platform;
    // gets the first keybinding for the command
    function getFirstKeybinding(binding) {
        if (typeof (binding) === "string") return binding.split("|")[0];
        else if (typeof (binding) === "object") return binding[platform].split("|")[0];
    }


    // Initialize the Context Menu Entries and update Keybindings depending on Platform
    var startAutocomplete = commands.byName['startAutocomplete'];
    $("div#editor_ctx_autocomplete span.submenukey").text(getFirstKeybinding(startAutocomplete.bindKey));
    $("div#editor_ctx_autocomplete").click(function () {
        theEditor.editor.focus();
        startAutocomplete.exec(theEditor.editor);
    });

    var ternRename = commands.byName['ternRename'];
    $("div#editor_ctx_rename span.submenukey").text(getFirstKeybinding(ternRename.bindKey));
    $("div#editor_ctx_rename").click(function () {
        theEditor.editor.focus();
        ternRename.exec(theEditor.editor);
    });

    var ternShowType = commands.byName['ternShowType'];
    $("div#editor_ctx_showtype span.submenukey").text(getFirstKeybinding(ternShowType.bindKey));
    $("div#editor_ctx_showtype").click(function () {
        theEditor.editor.focus();
        ternShowType.exec(theEditor.editor);
    });

    var ternJumpToDef = commands.byName['ternJumpToDef'];
    $("div#editor_ctx_showdef span.submenukey").text(getFirstKeybinding(ternJumpToDef.bindKey));
    $("div#editor_ctx_showdef").click(function () {
        theEditor.editor.focus();
        ternJumpToDef.exec(theEditor.editor);
    });

    var ternFindRefs = commands.byName['ternFindRefs'];
    $("div#editor_ctx_showrefs span.submenukey").text(getFirstKeybinding(ternFindRefs.bindKey));
    $("div#editor_ctx_showrefs").click(function () {
        theEditor.editor.focus();
        ternFindRefs.exec(theEditor.editor);
    });

    var beautify = commands.byName['beautify'];
    $("div#editor_ctx_beautify span.submenukey").text(getFirstKeybinding(beautify.bindKey));
    $("div#editor_ctx_beautify").click(function () {
        theEditor.editor.focus();
        beautify.exec(theEditor.editor);
    });

    $("div#editor_ctx_save").click(function () {
        theEditor.editor.focus();
        gisty.saveGist();
    });
}
