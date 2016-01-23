"use strict";
/*
    AdScriptor
    Copyright (c) 2016 crealytics GmbH All Rights Reserved.
    See LICENSE.md for License Information.
*/

/*
    Manages all requests send to Github.
    Please call authorizeToken() with a valid github token (with the scopes user and gist) before calling any other function.
*/
function GistRequester() {

}

/*
    Checks if authorizeToken() has already been called with a valid token.
*/
GistRequester.prototype.hasValidToken = function () {
    return this.hasOwnProperty("token");
};


/*
    Removes the currently stored token from this object.
    You must call authorizeToken() again if you want to make another request.
*/
GistRequester.prototype.deauthorizeToken = function () {
    if (this.hasValidToken()) {
        delete this.token;
    }
};

/*
    Checks if the token passed is valid and memorizes the token for
    further requests.
    The Callback will be called with two arguments: [bool] success, [string] error_description, [object] xhr_obj
    where success indicates if the token is valid. error_description and xhr_obj will only be passed if the
    authorization was unsuccessfull and will provide information about the error.
*/
GistRequester.prototype.authorizeToken = function (token, opt_callback) {
    // Validate Parameters
    if (typeof token !== "string")
        throw new TypeError("Parameter token should be a string.");
    else if (typeof opt_callback !== "function" && typeof opt_callback !== "undefined" && opt_callback !== null)
        throw new TypeError("Parameter opt_callback should be a function or undefined.");

    // Trim the Token Parameter
    token = token.trim();

    // Remove an already existing token
    this.deauthorizeToken();

    // Store this to access it from the callbacks
    var that = this;

    // Make a sample request to /user to check the authorization scopes.
    $.ajax({
        url: 'https://api.github.com/user',
        type: 'GET',
        headers: {
            'Authorization': 'token ' + token
        },
        cache: false
    }).done(function (data, textStatus, xhr) {
        // Successfull, check if all needed scopes are specified.
        var scopes = xhr.getResponseHeader("X-OAuth-Scopes").split(",");
        var user_found = false, gist_found = false;
        for (var i = 0; i < scopes.length; ++i) {
            var trimmed_scope = scopes[i].trim().toLowerCase();
            if (trimmed_scope == "user")
                user_found = true;
            else if (trimmed_scope == "gist")
                gist_found = true;
        }

        // Both user & gist permissions are set, report success and save the token.
        if (user_found && gist_found) {
            if (opt_callback)
                opt_callback(true);
            that.token = token;
        }
            // Handle all Error Cases for the Permissions
        else if (opt_callback) {
            if (user_found)
                opt_callback(false, "Gist Scope Permission is missing.", xhr);
            else if (gist_found)
                opt_callback(false, "User Scope Permission is missing.", xhr);
            else
                opt_callback(false, "Gist & User Scope Permission is missing.", xhr);
        }
    }).fail(function (xhr) {
        var status = xhr.statusCode();
        var git_msg = null;
        // Check if Github has provided an Error Message and append it
        if (typeof status === "object" && status !== null) {
            if (status.hasOwnProperty("responseJSON") && typeof status.responseJSON === "object") {
                if (status.responseJSON.hasOwnProperty("message") && typeof status.responseJSON.message === "string")
                    git_msg = status.responseJSON.message;
            }
        }
        // Call the Callback with the Success Status.
        if (opt_callback)
            opt_callback(false, xhr.status + " " + xhr.statusText + (git_msg ? (" - " + git_msg) : ""), xhr);
    });
};

/*
    Creates a Ajax Request for the specified url with the specified type (GET, POST, PATCH, etc..)
    The opt_payload parameter can be either a string or a object, that will be sent as request body.
    The opt_additional_headers parameter can be an associative array of header name <-> value pairs, for example: { 'A':'B' }
    The opt_callback specifies the callback function to be called. 
    The Callback Function gets the following arguments: [bool] success, [object] data | [string] error_msg, [object] xhr
    success indicates if the request was successfull, and if so data contains the parsed response. Otherwise a error_msg will be
    handed over instead of data. The third parameter is always the XHTTPRequest Object of the Request for futher investigation.
*/
GistRequester.prototype.createRequest = function (url, type, opt_callback, opt_payload, opt_additional_headers) {
    // Validate Parameters
    if (typeof url !== "string")
        throw new TypeError("Parameter url should be a string.");
    else if (typeof type !== "string")
        throw new TypeError("Parameter type should be a string.");
    else if (typeof opt_callback !== "function" && typeof opt_callback !== "undefined" && opt_callback !== null)
        throw new TypeError("Parameter opt_callback should be a function or undefined.");
    else if (typeof opt_payload !== "string" && typeof opt_payload !== "object" && typeof opt_payload !== "undefined")
        throw new TypeError("Parameter opt_payload should be a string, object or undefined.");
    else if (typeof opt_additional_headers !== "object" && typeof opt_additional_headers !== "undefined" && opt_additional_headers !== null)
        throw new TypeError("Parameter opt_additional_headers should be an object or undefined.");

    // Make sure a valid token is ready
    if (!this.hasValidToken())
        throw new TypeError("Please provide a valid token by calling authorizeToken() before calling this method.");

    // Create the Request Options
    var request_opts = {
        url: url,
        type: type,
        headers: {
            'Authorization': 'token ' + this.token
        },
        cache: false,
        dataType: 'json',
        jsonp: false
    };

    // Add optional payload
    if (opt_payload) {
        if (typeof opt_payload === "string")
            request_opts.data = opt_payload;
        else
            request_opts.data = JSON.stringify(opt_payload);
    }

    // Add additional headers
    if (opt_additional_headers) {
        for (var header_name in opt_additional_headers) {
            if (opt_additional_headers.hasOwnProperty(header_name)) {
                request_opts.headers[header_name] = opt_additional_headers[header_name];
            }
        }
    }

    // Create Ajax Request & execute it
    var request = $.ajax(request_opts);

    // Add Status Listeners
    request.done(function (data, textStatus, xhr) {
        // Check our Limits ( inform the user when less than 100 requests are left )
        var limit = parseInt(xhr.getResponseHeader("X-RateLimit-Remaining"));
        if (typeof limit === "number" && limit <= 100)
            Logger.warning("Github request limit is low. " + limit + " / 5000 requests for this hour remaining.");

        // Call the Callback if provided with the data
        if (opt_callback)
            opt_callback(true, data, xhr);
    });

    request.fail(function (xhr, textStatus, errorThrown) {
        var status = xhr.statusCode();
        var git_msg = null;
        // Check if Github has provided an Error Message and append it
        if (typeof status === "object" && status !== null) {
            if (status.hasOwnProperty("responseJSON") && typeof status.responseJSON === "object") {
                if (status.responseJSON.hasOwnProperty("message") && typeof status.responseJSON.message === "string")
                    git_msg = status.responseJSON.message;
            }
        }
        // Call the Callback with the Success Status.
        if (opt_callback)
            opt_callback(false, xhr.status + " " + xhr.statusText + (git_msg ? (" - " + git_msg) : ""), xhr);
    });
};

/*
    Requests information about the current user.
    The Callback will be called once the information is available.
    For Parameter information about callback refer to GistRequester.createRequest(opt_callback)
*/
GistRequester.prototype.requestUserInformation = function (callback) {
    if (typeof callback !== "function")
        throw new TypeError("Parameter callback should be a function.");

    this.createRequest("https://api.github.com/user", "GET", callback);
};

/*
    Gets the User as GistUser Object.
    The User Object is ready, once opt_callback gets called.
    For parameter information about opt_callback refer to GistUser.init()
*/
GistRequester.prototype.getUser = function (opt_callback) {
    // create a new User and return it.
    var user = new GistUser(this);
    user.init(opt_callback);
    return user;
};