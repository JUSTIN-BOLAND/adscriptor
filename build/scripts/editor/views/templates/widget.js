define(['jade'], function(jade) { if(jade && jade['runtime'] !== undefined) { jade = jade.runtime; }

return function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (name, position) {
buf.push("<div class=\"editor-widget\"><div class=\"drag-handle header\"><div class=\"drag-handle striped\"><div class=\"drag-handle stripe\"></div><div class=\"drag-handle stripe offset\"></div><div class=\"drag-handle stripe\"></div><div class=\"drag-handle stripe offset\"></div><div class=\"drag-handle stripe\"></div></div><div class=\"drag-handle wrapper\"><div class=\"drag-handle pull-right\"><span" + (jade.attr("title", position.collapsed ? 'Expand' : 'Collapse', true, false)) + " class=\"minimize-btn-container\"><span" + (jade.cls(['fa','fa-caret-left','minimize-btn',position.collapsed ? undefined : 'expanded'], [null,null,null,true])) + "></span></span><span title=\"Close\" class=\"fa fa-times close-btn\"></span></div><div class=\"drag-handle title\"><span class=\"drag-handle value\">" + (jade.escape(null == (jade_interp = name) ? "" : jade_interp)) + "</span></div></div></div><div class=\"content\"></div></div>");}.call(this,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"position" in locals_for_with?locals_for_with.position:typeof position!=="undefined"?position:undefined));;return buf.join("");
}

});