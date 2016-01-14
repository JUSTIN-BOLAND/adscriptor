/*
    AdScriptor
    Copyright (c) 2016 crealytics GmbH All Rights Reserved.
    See LICENSE.md for License Information.
*/
/*
    A simple Logger.
    Logs into the Log-Console at the bottom of the Page.
*/

var Logger = new (function () {
    this.log = function (html) {
        /* Append the new Line to the Log */
        var elem = $("div#console_lines");
        $("<div></div>").append(html).appendTo(elem);
        /* Remove Elements until 100 or less are left */
        var remove = $("div#console_lines > div").size();
        remove -= 100;
        if (remove > 0) {
            $("div#console_lines > div:nth-child(-n+" + remove + ")").remove();
        }
        // scroll to bottom of console
        $("div#console_pad").scrollTop($("div#console_pad").get(0).scrollHeight);
    };
    /* Functions for different severities */
    this.verbose = function (html) {
        this.log($("<span></span>").append("<span style='color: #CCCCCC;'>[VERBOSE]&nbsp;</span>").append(html));
    };
    this.info = function (html) {
        this.log($("<span></span>").append("<span style='color: #1080FF;'>[INFO]&nbsp;</span>").append(html));
    };
    this.warning = function (html) {
        this.log($("<span></span>").append("<span style='color: #E5E600;'>[WARNING]&nbsp;</span>").append(html));
    };
    this.error = function (html) {
        this.log($("<span></span>").append("<span style='color: #E60000;'>[ERROR]&nbsp;</span>").append(html));
    };
})();
