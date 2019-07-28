# AdScriptor Api Converter
Converts the Google AdWords API Autocompletion Files to a single JSON Type Definition File, that the ACE Editor understands.

You only need to use this tool if you want to refresh the AdWords Scripts API Autocompletion in AdScriptor.
We (crealytics) normally do this periodically, and commit the latest autocompletion file to the repository.


### How to use
1.  Open Google Chrome and go the AdWords Scripts Page in Google AdWords.
2.  Create a new AdWords Script and click on "Advanced APIs" on the Script Editing Page.
3.  Select all available APIs, confirm the Dialog Message.  
    ![Selecting all advanced APIs](docs/images/apis.png)
4.  Open the Developer Tools Console (press F12) and go to the "Sources" tab.
5.  Find the `tern.js` file, pretty-print it (click on the `{}` in the bottom left corner) and search for `exports.Server`.
    Set a breakpoint on the first line of this function.  
    ![Set ternjs breakpoint](docs/images/tern_breakpoint.png)
6.  Reload the page and wait until the debugging breakpoint triggers.  
    ![Wait for debugger](docs/images/debugger_pause.png)
7.  Go to the "Console" tab in Developer Tools and copy-paste the contents from [`grabDefinitions.min.js`](grabDefinitions.min.js).
    Then hit Enter. You should get a message telling you to un-pause the debugger.  
    ![Paste Snippet](docs/images/paste_snippet.png)
8.  Click the blue play button in the "Paused in debugger" popup to allow the site to load.  
    ![Click Play](docs/images/continue_execution.png)
9.  Wait until the site is loaded and the "Download Autocompletion Definitions" button appears.  
    ![Wait for Definitions](docs/images/wait_for_definitions.png)
10. Download the definitions by clicking on the button.
11. Copy the json file you downloaded to `res/AdWordsApi.json` in the repository root.
12. Done! You successfully updated the Autocompletion for AdScriptor!<br />
    Now you just need to verify that there are no errors in the file by trying out the autocompletion in your browser.

