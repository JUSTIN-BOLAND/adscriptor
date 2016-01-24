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
function Gist(requester, data)
{
    // Validate Parameters
    if (typeof requester !== "object" || requester === null || !(requester instanceof GistRequester))
        throw new TypeError("Parameter requester should be an GistRequester.");
    else if (typeof data !== "object" || data === null)
        throw new TypeError("Parameter data should be an object.");

    this.requester = requester;
    this.data = data;
}

/*
    Check if History Information is loaded for this Gist.
*/
Gist.prototype.hasHistory = function () {
    return this.hasOwnProperty("history");
}

/*
    Check if all Files are loaded for this Gist.
*/
Gist.prototype.hasFiles = function () {
    return this.hasOwnProperty("files_loaded");
}

/*
    Gets the Name of the Gist.
*/
Gist.prototype.getName = function () {
    return this.data.description;
}


/*
    A List of all Gists the User has.
    data is the data github returned for the gist list.
*/
function GistList(requester, data)
{
    // Validate Parameters
    if (typeof requester !== "object" || requester === null || !(requester instanceof GistRequester))
        throw new TypeError("Parameter requester should be an GistRequester.");
    else if (typeof data !== "object" || data === null)
        throw new TypeError("Parameter data should be an object.");

    this.requester = requester;
}


/*
    Represents a Github User.
    The requester parameter must an authorized instance of GistRequester.
*/
function GistUser(requester) {
    // Validate Parameters
    if (typeof requester !== "object" || requester === null || !(requester instanceof GistRequester))
        throw new TypeError("Parameter requester should be an GistRequester.");

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
        return;

    var that = this;
    // Request User Data
    this.requester.requestUserInformation(function (success, data_or_error, xhr) {
        // Save Userdata on success
        if (success) {
            that.userdata = data_or_error;
            // Request Gist Data
            this.requester.requestGistInformation(function (success, data_or_error, xhr) {
                // Process Gist Data on Success
                if (success) {
                    that.gistdata = new GistList(data_or_error);

                }
                // Failed to get Gistdata
                else {
                    delete that.userdata;
                    opt_callback(false);
                }
            });
        }
        // Failed to get Userdata
        else {
            opt_callback(false);
        }
    });
};

/*
    Returns whether the userdata has already been fetched or not.
*/
GistUser.prototype.isReady = function () {
    return this.hasOwnProperty("userdata") && this.hasOwnProperty("gistdata");
}

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
}