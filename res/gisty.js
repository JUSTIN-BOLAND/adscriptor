/*
    AdScriptor
    Copyright (c) 2016 crealytics GmbH All Rights Reserved.
    See LICENSE.md for License Information.
*/
/*
    Manages all Connections to github.
*/

/* gisty - The global Github Manager */
var gisty = new (function () {
    /* All Members are public to ease communication with Handlers */
    this.selectedGist = ""; // the id of the selected gist, e.g. "12345677"
    this.gists = []; // array of all gists of the user that are created with this editor
    this.token = null; // user authorization token
    this.gist_url = ""; // gist base url, most likely "https://gist.githubusercontent.com/USER_NAME_HERE/"

    /* Initializes the Gist Manager */
    this.init = function () {
        // check if a cached token exists
        var localToken = Store.getItem("token.crypt");
        if (typeof (localToken) === "string" && localToken !== null) {
            this.token = localToken;
            // load gists
            GetUserData(this.token, function (d) { gisty.loadGists(d); });
        }
        else {
            // ask the user to input a token
            AskUserForToken();
        }

        // set auto-save interval (5 mins)
        setInterval(function () {
            gisty.autosave();
        }, 5 * 60000);
    };

    /* returns the currently selected gist, or null if none is selected. */
    this.getCurrentGist = function () {
        // traverse the gists list and find the one which id matches the selectedGist id.
        for (var i = 0, len = this.gists.length; i < len; ++i) {
            if (this.gists[i].id == this.selectedGist) {
                return this.gists[i];
            }
        }
        // no current gist found -> no gist is selected -> return null
        return null;
    };

    /* Loads the List of Gists the User has. */
    this.loadGists = function (userdata) {
        Logger.info("Login successfull. Welcome back, " + userdata.login + "!");
        $("button#usernamehere").html(userdata.login); // Replace the User-Menu Button in the Main Menu with the Name of the Github User
        Logger.info("Retrieving Scripts...");
        this.gist_url = userdata.gists_url.replace("{/gist_id}", ""); // Remove Gist Id from Gist Url
        LoadGistList(this.gist_url, this.token, function (d) { gisty.showGists(d); }); // Load all Gists and display them once finished
    };

    /* Called from loadGists() - Makes the Gists visible to the User */
    this.showGists = function (all_gists) {
        for (var i = 0, len = all_gists.length; i < len; ++i) {
            var gist = all_gists[i];
            // check if gist has loader -> then it's one of our gists
            if (gist.hasOwnProperty("files") && typeof (gist.files) === "object" &&
               gist.files.hasOwnProperty("internalStartup.js") && typeof (gist.files["internalStartup.js"]) === "object") {
                // it's one of our gists! -> store it
                var gist_info = {
                    id: gist.id,
                    name: gist.description,
                    files: {},
                    num_files: 0,
                    dependencies: {}
                };
                // Load all Files into gist info (without content)
                for (var key in gist.files) {
                    gist_info.files[key] = {
                        url: gist.files[key].raw_url
                        /* content: null */
                    };
                    gist_info.num_files += 1;
                }
                // add to global gists
                this.gists.push(gist_info);
                // add sidebar entry for this gist
                $("<div class='gist' id='gist_" + gist_info.id + "'>" + gist_info.name + "</div>").appendTo("div#gist_list").click(function () {
                    gisty.activateGist($(this).attr('id').replace("gist_", ""));
                });
            }
        }
        Logger.info("Successfully loaded " + this.gists.length + " gists from your Account.");
    };

    /* Makes the Gist with Id id ready to be displayed (load file contents and dependencies) */
    this.activateGist = function (id) {
        // Can't activate current Gist - it's already activated!
        if (this.selectedGist == id)
            return;
        else {
            // If another Gist was selected, save it and close the Editor
            if (this.selectedGist.length !== 0) {
                this.autosave(); // auto-save, because it checks for changes first before saving.
                theEditor.unloadDocs();
            }
            // Select the new Gist and load it's contents
            this.selectedGist = id;
            $("div#gist_list div").removeClass("active-gist");
            $("div#gist_" + id).addClass("active-gist");
            this.initGist();
        }
    };

    /* Loads the Contents of a Gist */
    this.initGist = function () {
        var gist = this.getCurrentGist();
        var remainingFiles = gist.num_files;
        var scheduledFiles = 0;
        // Loop over all Files
        for (var filename in gist.files) {
            var file = gist.files[filename];
            // If it has a content property, we have fetched it already.
            if (file.hasOwnProperty("content")) {
                remainingFiles--;
                scheduledFiles++;
            }
            else {
                // No cached content available, load it from github
                GetGistFileContent(file.url, filename, function (data, name) {
                    gist.files[name].content = data;
                    remainingFiles--;
                    Logger.info("Retrieved File '" + name + "', " + remainingFiles + " Files remaining...");
                    if (remainingFiles == 0) {
                        // all files retrieved -> continue with dependencies
                        gisty.initGistDependency();
                    }
                });
            }
        }
        // All Files were already loaded -> continue with dependencies
        if (scheduledFiles == gist.num_files)
            this.initGistDependency();
        else
            Logger.info("Retrieving Files for Gist '" + gist.name + "'...");
    };

    /* Loads all the Dependencies for the Gist */
    this.initGistDependency = function () {
        // Get the current Gist and extract it's dependencies
        var gist = this.getCurrentGist();
        var loader_code = gist.files["internalStartup.js"].content;
        var deps = extractDependencies(loader_code);
        if (deps.length === 0) {
            // If there are no dependencies, we are finished
            this.toastGist();
        }
        else {
            // Resolve the Dependencies
            var remaining_deps = deps.length, skipped = 0;
            for (var i = 0; i < deps.length; ++i) {
                // if the dependency is already in the dependencies list of the gist, we already tried to get it
                // -> no need to load it again
                if (gist.dependencies.hasOwnProperty(deps[i].name)) {
                    remaining_deps--;
                    skipped++;
                }
                else {
                    // Try to load the Dependency and insert it into the Dependency List
                    GetFileContent(deps[i].url, deps[i].name, function (data, nam, suc, ur) {
                        remaining_deps--;
                        if (suc) {
                            gist.dependencies[nam] = {
                                resolved: true,
                                content: data,
                                url: ur
                            };
                            Logger.info("Successfully resolved Dependency '" + nam + "' ...");
                        }
                        else {
                            gist.dependencies[nam] = {
                                resolved: false,
                                content: null,
                                url: ur
                            };
                            Logger.warning("Failed to resolve Dependency '" + nam + "' ...");
                        }
                        if (remaining_deps == 0) {
                            // All Dependencies loaded -> Finally show the Gist to the User
                            gisty.toastGist();
                        }
                    });
                }
            }
            // There are no dependencies or all were already loaded -> show the gist to the user
            if (skipped == deps.length) {
                this.toastGist();
            } else {
                Logger.info("Resolving " + deps.length + " Dependencies for Gist '" + gist.name + "'...");
            }
        }
    };

    /* Sends the gist to the editor to display it. */
    this.toastGist = function () {
        var files = [], dependencies = [];
        var gist = this.getCurrentGist();
        // transform files into editor format
        for (var filename in gist.files) {
            if (filename !== "internalStartup.js") {
                files.push({
                    content: gist.files[filename].content,
                    name: filename
                });
            }
        }
        // transform successfully loaded dependencies into editor format
        for (var depname in gist.dependencies) {
            var dep = gist.dependencies[depname];
            if (dep.resolved === true) {
                dependencies.push({
                    name: depname,
                    content: dep.content,
                    url: dep.url
                });
            }
        }
        // send the files and dependencies to the editor to view it to the user
        theEditor.loadDocs(files, dependencies);
    };

    /* Saves the currently selected gist. */
    this.saveGist = function (opt_callback) {
        // Get all File Contents from the Editor (to update changes the user has made)
        var gist = this.getCurrentGist();
        var docs = theEditor.getDocs();
        for (var i = 0, len = docs.length; i < len; ++i) {
            gist.files[docs[i].name].content = docs[i].content;
        }
        // save the gist to github
        SaveGistNow(gist.id, gist.name, gist.files, opt_callback);
    };

    /* Called every few minutes to autosave the gist. */
    this.autosave = function () {
        // No Gist selected, so we can save nothing
        if (this.selectedGist.length === 0) {
            Logger.warning("Autosave failed: no script selected.");
        }
        else {
            // Check if any File has changed
            var gist = this.getCurrentGist();
            var docs = theEditor.getDocs();
            var changed = false;
            for (var i = 0, len = docs.length; i < len; ++i) {
                if (gist.files[docs[i].name].content !== docs[i].content)
                    changed = true;
            }
            // only auto-save if gist has changed.
            if(changed)
                this.saveGist();
        }
    };

    /* removes the gist selection */
    this.selectNothing = function () {
        if (this.selectedGist.length !== 0) {
            this.saveGist();
            theEditor.unloadDocs();
            this.selectedGist = "";
            $("div#gist_list div").removeClass("active-gist");
        }
    };

    /* adds a file to the currently selected gist */
    this.addFile = function (name) {
        var gist = this.getCurrentGist();
        var gist_id = this.selectedGist;

        gist.files[name] = {
            url: "dummy_url", // only a dummy url, however because this file has a content property, no-one will make a request to this url.
            content: "\nfunction foobar() {\n\treturn \"foobar\";\n}\n\n\n"
        };

        // update bootstrap code
        var code = gist.files["internalStartup.js"].content;
        var files = [];
        for (var key in gist.files) {
            if (key != "internalStartup.js")
                files.push(key);
        }
        gist.files["internalStartup.js"].content = createStartupCode(files, extractDependencies(code));

        // re-select the gist to apply changes
        gist.num_files += 1;
        this.selectNothing();
        this.activateGist(gist_id);
    };

});

/* Displays the Overlay that prompts the User to enter a Token */
function AskUserForToken() {
    $("div#overlay-header").html("Github Token");
    $("div#overlay-body").html($("div#overlay-templates div.overlay-user-token").html());
    $("div#force-overlay").css("display", "block");
}

/* Called when the User has entered a Token */
function UserTokenVerify() {
    // Get the Token, store it and verify it.
    var token = $("div#overlay-body input").val().trim();
    Store.setItem("token.crypt", token);
    CloseOverlay();
    gisty.token = token;
    // load the Gist List for the User
    GetUserData(token, function (d) { gisty.loadGists(d); });
}

/* Retrieves Information about the User */
function GetUserData(token, callback) {
    $.ajax({
        url: 'https://api.github.com/user',
        type: 'GET',
        data: { access_token: token },
        dataType: 'jsonp',
        cache: false
    }
           ).success(function (gistdata) {
               if (gistdata.meta.status != 200) {
                   Store.removeItem("token.crypt");
                   LogErrorOverlay("Failed to authenticate with Token.", "The Token you provided seems to be either invalid, mistyped, incomplete or misses one of the needed scopes. Please reload this page and enter a valid token.", JSON.stringify(gistdata, null, 2));
               }
               else {
                   callback(gistdata.data);
               }
           }).error(function (e) {
               Store.removeItem("token.crypt");
               LogErrorOverlay("Failed to authenticate with Token.", "The Token you provided seems to be either invalid, mistyped, incomplete or misses one of the needed scopes. Please reload this page and enter a valid token.", JSON.stringify(e, null, 2));
           });
}


function LoadCompleteGistList(url, token, data, deferred) {
    var promise = (deferred || $.Deferred());

    var fetch = $.ajax({
        url: url,
        type: 'GET',
        data: { access_token: token, since: "1970-01-01T00:00:00Z" },
        dataType: 'jsonp',
        cache: false
    });

    fetch.success(function(gistdata){
        if(gistdata.meta.status != 200) {
            promise.reject(gistdata);
        } else {
            var result = (data || []).concat(gistdata.data);

            var hasNext = false;
            if(gistdata.meta.Link) {
                for(var i = 0; i < gistdata.meta.Link.length; i++) {
                    var link = gistdata.meta.Link[i];
                    if(link[1].rel == "next") {
                        hasNext = true;
                        LoadCompleteGistList(link[0], token, result, promise);
                        break;
                    }
                }
            }

            if(!hasNext) {
                promise.resolve(result);
            }
        }
    });

    fetch.error(function(e){
        promise.reject(e);
    });


    return promise.promise();
}

/* Loads the Gist List for the User */
function LoadGistList(url, token, callback) {
    var promise = LoadCompleteGistList(url, token, null, null);
    promise.done(function (data) {
        callback(data);
    });

    promise.fail(function (e){
        Store.removeItem("token.crypt");
        LogErrorOverlay("Failed to authenticate with Token.", "The Token you provided seems to be either invalid, mistyped, incomplete or misses one of the needed scopes. Please reload this page and enter a valid token.", JSON.stringify(e, null, 2));
    });
}

/* Retrieves the File Content of a Gist File */
function GetGistFileContent(url, name, callback) {
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'text',
        cache: false
    }
           ).success(function (data) {
               if (data.length > 0) {
                   callback(data, name);
               }
               else {
                   LogErrorOverlay("Failed to retrieve File '" + name + "'.", "Github reported an error for this file.", JSON.stringify(data, null, 2));
               }
           }).error(function (e) {
               LogErrorOverlay("Failed to retrieve File '" + name + "'.", "Github reported an error for this file.", JSON.stringify(e, null, 2));
           });
}

/* Retrieves the File Content of any File (used for resolving dependencies) */
function GetFileContent(url, name, callback) {
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'text',
        cache: false
    }
           ).success(function (data) {
               if (data.length > 0) {
                   callback(data, name, true, url);
               }
               else {
                   LogErrorOverlay("Failed to retrieve Dependency '" + name + "'.", "Server didn't respond.", JSON.stringify(data, null, 2));
               }
           }).error(function (e) {
               LogErrorOverlay("Failed to retrieve Dependency '" + name + "'.", "Server didn't respond.", JSON.stringify(e, null, 2));
               callback(null, name, false, url);
           });
}

/* Saves the complete Gist to Github */
function SaveGistNow(gist_id, name, files, opt_call) {
    Logger.info("Saving Gist '" + name + "' ...");
    var data = {};
    data.files = {};
    for (var key in files) {
        if (files[key] === null)
            data.files[key] = null;
        else
            data.files[key] = { content: files[key].content };
    }
    $.ajax({
        url: 'https://api.github.com/gists/' + gist_id + "?access_token=" + gisty.token,
        type: 'PATCH',
        data: JSON.stringify(data),
        cache: false
    }
           ).success(function (gistdata) {
               Logger.info("Saved Gist '" + name + "' successfully.");
               if (opt_call) opt_call();
           }).error(function (e) {
               LogErrorOverlay("Failed to save Gist '" + name + "'.", "Github reported an error for saving this gist.", JSON.stringify(e, null, 2));
           });
}

/* Displays the New File Dialog */
function NewFilePrompt() {
    $("div#overlay-header").html("New File");
    $("div#overlay-body").html($("div#overlay-templates div.overlay-new-file").html());
    $("div#force-overlay").css("display", "block");
}

// small helper to check if a string str ends with suffix
function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/* Called when the User has entered a File Name and confirmed he wants to create a File */
function GistCreateFile() {
    var name = $("div#overlay-body input").val().trim();
    CloseOverlay();
    // Make sure the Filename is at least 1 charater long and ends with .js
    if (endsWith(name, ".js")) {
        if (name.length == 3) {
            Logger.error("Please enter a valid Filename.");
            return;
        }
    }
    else if (name.length == 0) {
        Logger.error("Please enter a valid Filename.");
        return;
    }
    else {
        name += ".js";
    }

    // Check if Gist is selected and File doesn't exist.
    var gist = gisty.getCurrentGist();
    if (gist === null) {
        Logger.error("Please select a Script first.");
        return;
    }

    if (gist.files.hasOwnProperty(name)) {
        Logger.error("A File with this name is already present. Please choose another one.");
        return;
    }

    // Add the File to the Gist
    gisty.addFile(name);
}

/* Displays the new Gist Dialog */
function NewGistPrompt() {
    $("div#overlay-header").html("New Script");
    $("div#overlay-body").html($("div#overlay-templates div.overlay-new-gist").html());
    $("div#force-overlay").css("display", "block");
}

/* Called when the User has entered a Gist Name and wants to create a new Gist */
function GistCreateGist() {
    // Retrieve Parameters and close overlay
    var name = $("div#overlay-body input.gist-name").val().trim();
    var public = $("div#overlay-body input.gist-public").prop('checked');
    CloseOverlay();
    if (name.length == 0) {
        Logger.error("Please enter a valid Script Name.");
        return;
    }
    // Create new Gist Data
    var data = {
        files: {
            "internalStartup.js": {
                content: createStartupCode(['main.js'], [])
            },
            "main.js": {
                content: "\nfunction main() {\n\tLogger.log(\"hello world!\");\n}\n\n\n"
            }
        },
        public: public,
        description: name
    };
    // Inform Github about the new Gist
    $.ajax({
        url: 'https://api.github.com/gists' + "?access_token=" + gisty.token,
        type: 'POST',
        data: JSON.stringify(data),
        cache: false
    }
           ).success(function (gistdata) {
               // Reload after successfull creation, to add the gist to the Gist List
               Logger.info("Created Gist '" + name + "' successfully.");
               location.reload();
           }).error(function (e) {
               LogErrorOverlay("Failed to create Script '" + name + "'.", "Github reported an error for creating this gist.", JSON.stringify(e, null, 2));
           });
}

/* Called when the User clicks the Delete Gist Menu Entry. */
function DeleteGistPrompt() {
    var gist = gisty.getCurrentGist();
    if (gist === null) {
        Logger.error("Please select the Script you want to delete.");
        return;
    }

    $("div#overlay-header").html("Delete Script");
    $("div#overlay-body").html($("div#overlay-templates div.overlay-delete-gist").html());
    $("div#overlay-body span.gist-name").text(gist.name);
    $("div#force-overlay").css("display", "block");
}

/* Called when the User is sure he wants to delete the Gist */
function GistDeleteGist() {
    var name = $("div#overlay-body span.gist-name").text().trim();
    CloseOverlay();
    var gist = gisty.getCurrentGist();
    // Delete the Gist
    $.ajax({
        url: 'https://api.github.com/gists/' + gist.id + "?access_token=" + gisty.token,
        type: 'DELETE',
        cache: false
    }
         ).success(function (gistdata) {
             Logger.info("Deleted Script '" + name + "' successfully.");
             location.reload();
         }).error(function (e) {
             LogErrorOverlay("Failed to delete Script '" + name + "'.", "Github reported an error for deleting this gist.", JSON.stringify(e, null, 2));
         });
}

/* Called when the User wants to delete a file */
function DeleteFilePrompt() {
    var gist = gisty.getCurrentGist();
    if (gist === null) {
        Logger.error("Please select a Script first from which you want to delete a File.");
        return;
    }
    var filename = $("div.active_tab").text().trim();
    if (filename == "main.js" || filename == "internalStartup.js") {
        Logger.error("You can't delete main.js or internalStartup.js");
        return;
    }

    $("div#overlay-header").html("Delete File");
    $("div#overlay-body").html($("div#overlay-templates div.overlay-delete-file").html());
    $("div#overlay-body span.file-name").text(filename);
    $("div#force-overlay").css("display", "block");
}

/* called when the user is sure he wants to delete the file */
function GistDeleteFile() {
    var name = $("div#overlay-body span.file-name").text().trim();
    CloseOverlay();
    var gist = gisty.getCurrentGist();
    gist.files[name] = null;

    // update bootstrap code
    var code = gist.files["internalStartup.js"].content;
    var files = [];
    for (var key in gist.files) {
        if (key != "internalStartup.js" && key != name)
            files.push(key);
    }
    gist.files["internalStartup.js"].content = createStartupCode(files, extractDependencies(code));

    // save and reload
    SaveGistNow(gist.id, gist.name, gist.files, function () {
        location.reload();
    });
}

/* Called when the User wants to get the embedding code */
function EmbedGistPopup() {
    var gist = gisty.getCurrentGist();
    if (gist === null) {
        Logger.error("Please select the Script you want to embed into AdWords.");
        return;
    }
    // create the embedding code
    var raw_url = gist.files["internalStartup.js"].url.replace(/\/raw\/.*/i, "/raw/");
    var embed_text = 'var __URL = "$URL";\n' +
					 'function main(){throw new Error("main function is missing.");}\n' +
					 'eval(UrlFetchApp.fetch(__URL + "internalStartup.js" + "?d=" + new Date().getTime()).getBlob().getDataAsString());\n' +
					 '/* AdWordsApp.ads() MccApp.accounts() DriveApp.getFiles() Jdbc.getCloudSqlConnection() MailApp.sendEmail() SpreadsheetApp.getActive() UrlFetchApp.fetch() */';
    var text = embed_text.replace("$URL", raw_url);
    // show the overlay
    $("div#overlay-header").html("Show AdWords Embedding Code");
    $("div#overlay-body").html($("div#overlay-templates div.overlay-embed-gist").html());
    var markall = function(){ $this = $(this); setTimeout(function(){ $this.select(); }, 1); };
    $("div#overlay-body textarea").val(text).focus(markall).click(markall);
    $("div#force-overlay").css("display", "block");
}

/* Called when the user wants to edit the Gist Dependencies */
function GistEditDependencies() {
    var gist = gisty.getCurrentGist();
    if (gist === null) {
        Logger.error("Please select a Script to edit Dependencies.");
        return;
    }
    // extract the dependencies from the bootstrap code and format them nicely
    var code = gist.files["internalStartup.js"].content;
    var dependencies = extractDependencies(code);
    var dep_str = "";
    for (var i = 0; i < dependencies.length; ++i) {
        dep_str += dependencies[i].name + " | " + dependencies[i].url + "\n";
    }
    dep_str = dep_str.trim();
    // show the user the dependencies
    $("div#overlay-header").html("Script Dependencies");
    $("div#overlay-body").html($("div#overlay-templates div.overlay-edit-dependencies").html());
    $("div#overlay-body textarea").val(dep_str);
    $("div#force-overlay").css("display", "block");
}

/* Called when the User is done with editing dependiencies */
function ApplyDependencies() {
    var dep_strs = $("div#overlay-body textarea").val().trim().split("\n");
    CloseOverlay();
    var gist = gisty.getCurrentGist();

    // Parse the new Dependencies
    var lookat = [];
    for (var i = 0; i < dep_strs.length; ++i) {
        var line = dep_strs[i].trim();
        if (line.length > 0 && line.indexOf("|") != -1) {
            var elems = line.split("|");
            if (elems.length == 2) {
                lookat.push([elems[0].trim(), elems[1].trim()]);
            }
        }
    }

    Logger.info("Applying Dependencies...");

    // Rebuild bootstrap code
    var deps = [];
    for (var i = 0; i < lookat.length; ++i) {
        deps.push({
            name: lookat[i][0],
            url: lookat[i][1]
        });
    }
    var files = [];
    for (var key in gist.files) {
        if (key != "internalStartup.js")
            files.push(key);
    }
    gist.files["internalStartup.js"].content = createStartupCode(files, deps);

    // Save the Gist and reload the Page to apply the dependency changes
    gisty.saveGist(function () {
        location.reload();
    });
}

/* Called when the User wants to download the gist */
function ExportGist() {
    var gist = gisty.getCurrentGist();
    if (gist === null) {
        Logger.error("Please select the Script you want to export.");
        return;
    }
    // Create a nice little zip File from the Gist
    var zip = new JSZip();
    for (var key in gist.files) {
        zip.file(key, gist.files[key].content);
    }
    var content = zip.generate({ type: "blob" });

    // Promt the User to download the zip File.
    saveAs(content, gist.name + ".zip");
}

