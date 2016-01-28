"use strict";
/*
    AdScriptor
    Copyright (c) 2016 crealytics GmbH All Rights Reserved.
    See LICENSE.md for License Information.
*/

/*
    Provides Classes for all Github Data, like Gists, the User, etc...
*/


/*
    Represents a single Gist.
    data is the data github returned for this gist.
*/
function Gist(requester, data) {
    // Validate Parameters
    if (typeof requester !== "object" || requester === null || !(requester instanceof GistRequester))
        throw new TypeError("Parameter requester should be a GistRequester.");
    else if (typeof data !== "object" || data === null)
        throw new TypeError("Parameter data should be an object.");

    this.requester = requester;
    this.data = data;
}

/*
    Check if History Information is loaded for this Gist.
*/
Gist.prototype.hasHistory = function () {
    return this.data.hasOwnProperty("history");
};

/*
    Check if all Files are loaded for this Gist.
*/
Gist.prototype.hasFiles = function () {
    return this.hasOwnProperty("files_loaded");
};

/*
    Gets the Name of the Gist. (Saved as Description because Gists don't have names)
*/
Gist.prototype.getName = function () {
    return this.data.description;
};

/*
    Gets the Id of the Gist.
*/
Gist.prototype.getId = function() {
    return this.data.id;
};

/*
    Loads the Gist completely (retrieve all files & dependencies & history)
    // opt_callback will be called with [bool] success, to indicate success or failure.
*/
Gist.prototype.loadGist = function (opt_callback) {
    // Validate Parameters
    if (typeof opt_callback !== "function" && typeof opt_callback !== "undefined" && opt_callback !== null)
        throw new TypeError("Parameter opt_callback should be a function or undefined.");

    // Nothing to do if everything is already loaded.
    if (this.hasHistory() && this.hasFiles()) {
        if (opt_callback)
            opt_callback(true);
        return;
    }

    var that = this;
    // Load general Gist Information
    this.requester.requestGistInformation(this.getId(), function (success, data_or_error, xhr) {
        if(success)
        {
            // Got some Gist Data
            that.data = data_or_error;

            // Check if all Files are not truncated & re-retrieve truncated ones
            for(var filename in data_or_error.files)
            {
                if(data_or_error.files.hasOwnProperty(filename))
                {
                    var filedata = data_or_error.files[filename];
                    if(filedata.truncated === true || filedata.truncated === "true")
                    {
                        // Todo: Load file if it is too large (get request to raw_url)
                    }
                }
            }
        }
        else
        {
            // Failed to get Information about the Gist
            if (opt_callback)
                opt_callback(false);
        }
    });
};


/*
    A List of all Gists the User has.
    data is the data github returned for the gist list.
*/
function GistList(requester, data) {
    // Validate Parameters
    if (typeof requester !== "object" || requester === null || !(requester instanceof GistRequester))
        throw new TypeError("Parameter requester should be a GistRequester.");
    else if (typeof data !== "object" || data === null || !Array.isArray(data))
        throw new TypeError("Parameter data should be an array.");

    this.requester = requester;
    // List of all Gists from this User.
    this.gists = [];

    // Loop over the Gist List from Github and check for the internalStartup.js & main.js Files,
    // which must be present in every Gist this programm creates.
    for(var i = 0; i < data.length; ++i)
    {
        var gist = data[i];
        var files_found = 0;
        if(gist.hasOwnProperty("files") && typeof gist.files === "object")
        {
            for(var filename in gist.files)
            {
                if(gist.files.hasOwnProperty(filename))
                {
                    if (filename === "internalStartup.js" || filename === "main.js")
                        files_found++;
                }
            }
        }
        // both needed files are there, so it's probably a gist this programm created.
        if(files_found == 2)
        {
            // Push the Gist into the GistList
            this.gists.push(new Gist(requester, gist));
        }
    }
}

/*
    Gets how many Gists the User currently has.
*/
GistList.prototype.count = function () {
    return this.gists.length;
};

/*
    Gets the List of Gists as Array.
*/
GistList.prototype.getGists = function () {
    return this.gists;
};

/*
    Gets a single Gist by Id.
    Returns null if id was not found in the gist list.
*/
GistList.prototype.getGistById = function (id) {
    // Validate Parameters
    if (typeof id !== "string")
        throw new TypeError("Parameter id should be a string.");

    // Loop over the Gists and search for the Id.
    for (var i = 0; i < this.gists.length; ++i) {
        if (this.gists[i].getId() === id)
            return this.gists[i];
    }

    return null;
};


/*
    Represents a Github User.
    The requester parameter must an authorized instance of GistRequester.
*/
function GistUser(requester) {
    // Validate Parameters
    if (typeof requester !== "object" || requester === null || !(requester instanceof GistRequester))
        throw new TypeError("Parameter requester should be a GistRequester.");

    // Save the Requester for later use
    this.requester = requester;
}

/*
    Retrieves the Userdata from Github.
    opt_callback will be called once the data is available, or if an error has occured.
    opt_callback will be called with [bool] success, where success determines if the call was successfull or not.
    If opt_callback is called with true, you can invoke other methods of this object.
*/
GistUser.prototype.init = function (opt_callback) {
    // Validate Parameters
    if (typeof opt_callback !== "function" && typeof opt_callback !== "undefined" && opt_callback !== null)
        throw new TypeError("Parameter opt_callback should be a function or undefined.");
    // Only retrieve Userdata once
    if (this.isReady())
    {
        if (opt_callback)
            opt_callback(true);
        return;
    }

    var that = this;
    // Request User Data
    this.requester.requestUserInformation(function (success, data_or_error, xhr) {
        // Save Userdata on success
        if (success) {
            that.userdata = data_or_error;
            // Request Gist Data
            that.requester.requestGistInformation(function (success, data_or_error, xhr) {
                // Process Gist Data on Success
                if (success) {
                    that.gistdata = new GistList(that.requester, data_or_error);
                    if(opt_callback)
                        opt_callback(true);
                }
                    // Failed to get Gistdata
                else {
                    Logger.formatAjaxError("Failed to retrieve the List of all Gists.", data_or_error, xhr);
                    delete that.userdata;
                    if(opt_callback)
                        opt_callback(false);
                }
            });
        }
            // Failed to get Userdata
        else {
            Logger.formatAjaxError("Failed to retrieve Information about the User.", data_or_error, xhr);
            if(opt_callback)
                opt_callback(false);
        }
    });
};

/*
    Returns whether the userdata has already been fetched or not.
*/
GistUser.prototype.isReady = function () {
    return this.hasOwnProperty("userdata") && this.hasOwnProperty("gistdata");
};

/*
    Gets the Name of the Github User, or the Account Name if the Name isn't available.
    If both are missing, it returns 'User'.
*/
GistUser.prototype.getName = function () {
    if (!this.isReady())
        throw new TypeError("Please call init() before this function.");
    // Check for name
    if (this.userdata.hasOwnProperty("name") && typeof this.userdata.name === "string")
        return this.userdata.name;
        // Use Login as Alternative
    else if (this.userdata.hasOwnProperty("login") && typeof this.userdata.login === "string")
        return this.userdata.login;
        // Else use default
    else
        return "User";
};
