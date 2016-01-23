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
*/
function Gist(requester, id)
{

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
    this.requester.requestUserInformation(function (success, data_or_error, xhr) {
        // Save Userdata on success
        if (success) {
            that.userdata = data_or_error;
        }
                opt_callback(false, data_or_error);
        }
    });
};

/*
    Returns whether the userdata has already been fetched or not.
*/
GistUser.prototype.isReady = function () {
    return this.hasOwnProperty("userdata");
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