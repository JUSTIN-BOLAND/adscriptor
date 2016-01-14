/*
    AdScriptor
    Copyright (c) 2016 crealytics GmbH All Rights Reserved.
    See LICENSE.md for License Information.
*/
/*
    Some simple Functions to show and hide the overlay
*/

/* Hides the Overlay and cleans up */
function CloseOverlay()
{
  $("div#overlay-header").html("");
  $("div#overlay-body").html("");
  $("div#force-overlay").css("display", "none"); 
}

/* Shows an Error overlay */
function ShowErrorOverlay(desc, longDesc, json)
{
  $("div#overlay-header").html("<span style='color: #CC0000; font-weight: 900;'>Error</span>");
  $("div#overlay-body").html($("div#overlay-templates div.overlay-error-desc").html());
  $("div#overlay-body p.overlay-error-desc").text(desc);
  $("div#overlay-body p.overlay-error-detail").text(longDesc);
  $("div#overlay-body textarea.overlay-error-text").val(json);
  $("div#force-overlay").css("display", "block");
}

/* Logs a error message with the Logger containing a link to view the Error Overlay */
function LogErrorOverlay(desc, longDesc, json)
{
  var show_report = function(){ ShowErrorOverlay(desc, longDesc, json); };
  var link = $("<a href='javascript:void(0);'>Click here</a>");
  link.click(show_report);
  var elem = $("<span></span>").append(desc + " (").append(link).append(" for more information.)");
  Logger.error(elem);
}
