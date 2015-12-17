/*
    Google Adwords Script Editor
    Copyright (c) 2015 Sven Fisch, crealytics GmbH All Rights Reserved.
*/
/*
    Contains some Functions to create and edit the internalStartup.js File contained in every Gist.
*/

// The Startup Code Template. Replace $DEPENDENCIES with the Dependencies and $SCRIPTS with the Scripts
var startup_code = '/* Auto-Generated File - Don\'t mess with it. */\n' +
        'var __LINE_FILE_LOOKUP = {};\n' +
        'function __CURRENT_LINE() { try { throw new Error(); } catch (e) { return parseInt(e.stack.split("\\n")[1].match(/:[0-9]*/igm)[0].substring(1)); } }\n' +
        'function __LOAD(file, relative, line, name) { __LINE_FILE_LOOKUP[line] = (relative ? file : name); return UrlFetchApp.fetch((relative ? (__URL + file) : (file)) + "?d=" + new Date().getTime()).getBlob().getDataAsString(); }\n' +
        'function __WRAP_FN(fn) { return function() { try { return fn.apply(this, arguments); } catch (e) { if (e.hasOwnProperty("_f")) throw e; throw __FMT_ERROR(e); } }; } var __WRAP_FN_LINE = __CURRENT_LINE();\n' +
        'function __FMT_ERROR(e) { if (typeof(e) !== "object") return e; var stck = e.stack.split("\\n"), result = []; for (var i = 0; i < stck.length; ++i) { var matches = stck[i].match(/#([0-9]*)\\(eval\\)/igm);\n' +
        '                          if (matches === null) { result.push(stck[i].replace("Code", "<code>")); } else if (matches.length == 1) { if (parseInt(stck[i].match(/:[0-9]*/igm)[0].substring(1)) == __WRAP_FN_LINE)\n' +
        '                          continue; result.push(stck[i].replace(/Code(#[0-9]*\\(eval\\))*/igm, "<internal-startup>")); } else { var line = matches[1].replace(/[^0-9]*/igm, "");\n' +
        '                          if (__LINE_FILE_LOOKUP.hasOwnProperty(line)) { result.push(stck[i].replace(/Code#[0-9]*\\(eval\\)#[0-9]*\\(eval\\)/im, __LINE_FILE_LOOKUP[line])); } else {\n' +
        '                          result.push(stck[i].replace(/Code#[0-9]*\\(eval\\)/im, "<internal-startup>")); } } } var err = new Error((e.message + "\\n" + result.join("\\n")).trim()); err._f = true; return err; }\n' +
        'try {\n' +
        '/*DEPENDENCY_TEMPLATE[=[eval(__LOAD("$URL", false, __CURRENT_LINE(), "$NAME"));]=]*/\n' +
        '$DEPENDENCIES\n' +
        '/*SCRIPT_TEMPLATE[=[eval(__LOAD("$LIB", true, __CURRENT_LINE()));]=]*/\n' +
        '$SCRIPTS\n' +
        '} catch (e) { throw __FMT_ERROR(e); }\n' +
        'for (var keys = Object.keys(this), i = 0, len = keys.length; i < len; ++i) { if (typeof(this[keys[i]]) === "function") { this[keys[i]] = __WRAP_FN(this[keys[i]]); } }';
// Template Line for a Script
var script_template = 'eval(__LOAD("$LIB", true, __CURRENT_LINE()));';
// Template Line for a Dependency
var dependency_template = 'eval(__LOAD("$URL", false, __CURRENT_LINE(), "$NAME"));';

/*
    Creates and returns the Startup Code for a Gist.
    filenames: An Array containing all Filenames of the Gist (excluding internalStartup.js), e.g. ["a.js", "b.js", "main.js"]
    dependencies: An Array containing all Dependencies of the Gist, e.g. [{name: "underscore", url: "http://under.score/sample/"}]
*/
function createStartupCode(filenames, dependencies) {
    var code = startup_code;

    // insert the filenames into the script template
    var zipped_filenames = [];
    for (var i = 0; i < filenames.length; ++i) {
        zipped_filenames.push(script_template.replace("$LIB", filenames[i]));
    }
    // append begin and end markers
    zipped_filenames.unshift('/*BEGIN_SCRIPTS*/');
    zipped_filenames.push('/*END_SCRIPTS*/');
    // join the lines and replace them in the code
    var filenames_comp = zipped_filenames.join("\n");
    code = code.replace("$SCRIPTS", filenames_comp);

    // insert the dependencies into the dependency template
    var zipped_deps = [];
    for (var i = 0; i < dependencies.length; ++i) {
        zipped_deps.push(dependency_template.replace("$URL", dependencies[i].url).replace("$NAME", dependencies[i].name));
    }
    // append begin and end markers
    zipped_deps.unshift('/*BEGIN_DEPENDENCIES*/');
    zipped_deps.push('/*END_DEPENDENCIES*/');
    // join the lines and replace them in the code
    var deps_comp = zipped_deps.join("\n");
    code = code.replace("$DEPENDENCIES", deps_comp);

    // return the finished startup code for internalStartup.js
    return code;
}

/*
    Extracts the Dependencies defined in the Startup-Script in code.
    Returns an Array of Dependencies, e.g. [{name: "underscore", url: "http://under.score/sample/"}]
*/
function extractDependencies(code) {
    // Regex matching the begin and end tag of the dependency section
    var regex = /\/\*BEGIN_DEPENDENCIES\*\/((.|\n)*)\/\*END_DEPENDENCIES\*\//i;
    // Regex matching a dependency line, with a separate Capture Group for name and url
    var regex2 = /\s*eval\s*\(\s*__LOAD\s*\(\s*"(.*?)"\s*,\s*false\s*,\s*__CURRENT_LINE\s*\(\s*\)\s*,\s*"(.*?)"\s*\)\s*\)\s*;/i;

    // Find the Dependency Section, split into individual lines and remove start and end markers
    var code_deps = code.match(regex)[0].split("\n").slice(1, -1);
    var deps = [];
    for (var i = 0; i < code_deps.length; ++i) {
        // extract the dependency name and url
        var res = regex2.exec(code_deps[i]);
        deps.push({
            url: res[1],
            name: res[2]
        });
    }
    // return all found dependencies
    return deps;
}
