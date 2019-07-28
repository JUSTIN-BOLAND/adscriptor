(function() {
  let fmt = {
    default: {css: "font-weight: inherit; color: inherit;"},
    bold: {css: "font-weight: bold;"},
    redBold: {css: "font-weight: bold; color: #f00;"},
    greenBold: {css: "font-weight: bold; color: #0a0;"}
  };
  function fmtStr(strings, ...values) {
    let resultStr = "%cAdWords Definition Grabber: %c" + strings[0];
    let fmtArgs = [fmt.bold.css, fmt.default.css];
    for(let [idx, value] of Object.entries(values)) {
      if(value.css) {
        resultStr += "%c";
        fmtArgs.push(value.css);
      } else
        resultStr += value;
      resultStr += strings[+idx + 1];
    }
    return [resultStr, ...fmtArgs];
  }

  if(!tern || !tern.Server) {
    console.log(...fmtStr`${fmt.redBold}Error: tern is not defined`);
    return;
  }

  let definitions = [];

  let addDef = tern.Server.prototype.addDefs;
  tern.Server.prototype.addDefs = function(defs, toFront) {
    if(toFront)
      definitions.unshift(defs);
    else
      definitions.push(defs);

    for(let key of Object.keys(defs))
      if(key[0] !== "!")
        console.log(...fmtStr`Found definition for ${fmt.greenBold}${key}`)
    return addDef.apply(this, arguments);
  };

  let reset = tern.Server.prototype.reset;
  tern.Server.prototype.reset = function() {
    if(definitions.length > 0) {
      let result = JSON.stringify({definitions});
      let blob = new Blob([result], { type: "application/json" });
      let url = URL.createObjectURL(blob);

      let overlay = document.createElement("div");
      Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: "1000000"
      });

      let link = document.createElement("a");
      Object.assign(link.style, {
        padding: '24px',
        backgroundColor: '#4285f4',
        color: '#fff',
        textDecoration: 'none'
      });
      link.appendChild(document.createTextNode("Download Autocompletion Definitions"));
      link.setAttribute('download', 'AdWordsApi.json');
      link.setAttribute('href', url);

      overlay.appendChild(link);
      document.body.appendChild(overlay);
      console.log(...fmtStr`${fmt.greenBold}Done. Please click the download button to download the definition file.`);
    }
    return reset.apply(this, arguments);
  };

  console.log(...fmtStr`Ready. ${fmt.greenBold}Please continue script execution now.`);
})();
