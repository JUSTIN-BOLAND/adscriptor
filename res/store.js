/*
    Google Adwords Script Editor
    Copyright (c) 2015 Sven Fisch, crealytics GmbH All Rights Reserved.
*/
/*
    A Bridge between our Scripts and localStorage.
    Tries to store Key-Value Pairs in local storage,
    cookies or a plain javascript object.
    Available Functions: getItem(name), setItem(name, value), removeItem(name)
    Only String Values are supported for name and value.
*/

var Store = (function () {
    /* A Interface for the localStorage Object of the Browser */
    function localStorageInterface() {
        this.working = false;
        this.save = function (name, data) { if (data !== null) window.localStorage.setItem(name, data); else window.localStorage.removeItem(name); };
        this.load = function (name) { return window.localStorage.getItem(name); };

        // Check if local Storage is available
        if (typeof (window.localStorage) === "object" && window.localStorage !== null) {
            if (typeof (window.localStorage.setItem) === "function" && typeof (window.localStorage.getItem) === "function" && typeof (window.localStorage.removeItem) === "function") {
                window.localStorage.setItem("test", "test");
                if (window.localStorage.getItem("test") === "test")
                    this.working = true;
                window.localStorage.removeItem("test");
            }
        }
    }
    /* A Interface for the cookie storage */
    function cookieInterface() {
        this.working = false;
        this.save = function (name, data) { if (data !== null) setCookie(name, data); else deleteCookie(name); }
        this.load = function (name) { return getCookie(name); }
        /* Private Helper Functions */
        function setCookie(name, value) { window.document.cookie = name + "=" + value; }
        function getCookie(cname) {
            var name = cname + "=";
            var ca = window.document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1);
                if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
            }
            return null;
        }
        function deleteCookie(name) { window.document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC"; }

        // Check if Cookies are available
        if (typeof (window.document.cookie) === "object" && window.document.cookie !== null) {
            setCookie("test", "test");
            if (getCookie("test") === "test")
                this.working = true;
            deleteCookie("test");
        }
    }
    /* A Interface for a simple Javascript Object */
    function objectInterface() {
        this.working = true; // objects work always
        var store = {};
        this.save = function (name, data) { if (data !== null) store[name] = data; else delete store[name]; };
        this.load = function (name) { if (store.hasOwnProperty(name)) return store[name]; else return null; };
    }

    // Select the first working Interface
    var container = null;
    if (container === null) {
        container = new localStorageInterface();
        if (!container.working) container = null;
    }
    if (container === null) {
        container = new cookieInterface();
        if (!container.working) container = null;
    }
    if (container === null) {
        container = new objectInterface();
        if (!container.working) container = null;
    }

    // Create the global Store Object
    return {
        setItem: function (name, value) { container.save(name, value); },
        getItem: function (name) { return container.load(name); },
        removeItem: function (name) { container.save(name, null); }
    };
})();