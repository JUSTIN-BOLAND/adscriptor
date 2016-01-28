"use strict";
/*
    AdScriptor
    Copyright (c) 2016 crealytics GmbH All Rights Reserved.
    See LICENSE.md for License Information.
*/


/*
    A simple Logger.
    Logs into the Log-Console at the bottom of the Page.
*/
function Log()
{

}

Log.prototype.internal_log = function(severity, html) {
    // Get current Date & Time with Timezone Offset
    var now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    var now_str = now.toJSON();
    now_str = now_str.slice(0, 10) + " " + now_str.slice(11, 19);

    // Format the Date and Severity
    var date_elem = $("<span class='log-timestamp'>" + now_str + "</span>");
    var severity_elem = $("<span class='log-severity-" + severity.toLowerCase() +"'>" + severity.toUpperCase() + "</span>");

    // All Logs go in here
    var logger_elem = $("div#console_lines");

    // Compose the Log Entry and add it to the DOM
    var log_elem = $("<div></div>")
            .append("<span class='log-bracket'>[</span>")
            .append(date_elem)
            .append("<span class='log-bracket'>]&nbsp;[</span>")
            .append(severity_elem)
            .append("<span class='log-bracket'>]</span>")
            .append("&nbsp;&nbsp;&nbsp;")
            .append(html)
            .appendTo(logger_elem);

    // Remove Elements until 100 or less are left
    var remove = $("div#console_lines > div").size();
    remove -= 100;
    if (remove > 0)
        $("div#console_lines > div:nth-child(-n+" + remove + ")").remove();

    // Scroll to the bottom of the Console
    $("div#console_pad").scrollTop($("div#console_pad").get(0).scrollHeight);

};

/*
    Logs html (Plain Text, HTML or a JQuery Element)
    with the specified severity or "info", if the specified severity is not found.
*/
Log.prototype.log = function(severity, html) {
    severity = severity.toLowerCase();
    switch(severity)
    {
        case "debug":
            this.debug(html);
            break;
        case "verbose":
            this.verbose(html);
            break;
        default: // info is the default level
        case "info":
            this.info(html);
            break;
        case "warning":
            this.warning(html);
            break;
        case "error":
            this.error(html);
            break;
        case "fatal":
            this.fatal(html);
            break;
    }
};

/* Logging Methods for different severities */
Log.prototype.debug = function(html) {
    this.internal_log("debug", html);
}

Log.prototype.verbose = function (html) {
    this.internal_log("verbose", html);
};

Log.prototype.info = function (html) {
    this.internal_log("info", html);
};

Log.prototype.warning = function (html) {
    this.internal_log("warning", html);
};

Log.prototype.error = function (html) {
    this.internal_log("error", html);
};

Log.prototype.fatal = function (html) {
    this.internal_log("fatal", html);
};

/* Formats an Error that occurred during an Ajax Call.
   error_description is the description of the error, readable to normal humans.
   error_msg is the http error code + message and xhr is the XHTTP-Request object.
*/
Log.prototype.formatAjaxError = function (error_description, error_msg, xhr) {
    // format a nice error message
    // TODO: Maybe log more Error Details?
    var error_text = error_description + " (" + error_msg + ")";
    this.error(error_text);
};

// Create the only instance of Log.
var Logger = new Log();
