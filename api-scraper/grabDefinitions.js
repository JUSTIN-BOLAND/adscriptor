(function() {
  let definitions = [];
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

  function createDownloadButton() {
    let result = JSON.stringify({definitions}, null, 2);
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
    link.onclick = function() {
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 1000);
    };

    overlay.appendChild(link);
    document.body.appendChild(overlay);
  }

  const fixups = [
    {find: /(:\s*?|->\s*?)(?:\?|\+)?byte\b/gi, replace: "$1number"},
    {find: /(:\s*?|->\s*?)(?:\?|\+)?int\b/gi, replace: "$1number"},
    {find: /(:\s*?|->\s*?)(?:\?|\+)?integer\b/gi, replace: "$1number"},
    {find: /(:\s*?|->\s*?)(?:\?|\+)?long\b/gi, replace: "$1number"},
    {find: /(:\s*?|->\s*?)(?:\?|\+)?short\b/gi, replace: "$1number"},
    {find: /(:\s*?|->\s*?)(?:\?|\+)?float\b/gi, replace: "$1number"},
    {find: /(:\s*?|->\s*?)(?:\?|\+)?double\b/gi, replace: "$1number"},
    {find: /(:\s*?|->\s*?)(?:\?|\+)?numeric\b/gi, replace: "$1number"},
    {find: /(:\s*?|->\s*?)(?:\?|\+)?number\b/gi, replace: "$1number"},
    {find: /(:\s*?|->\s*?)(?:\?|\+)?string\b/gi, replace: "$1string"},
    {find: /(:\s*?|->\s*?)(?:\?|\+)?char\b/gi, replace: "$1string"},
    {find: /(:\s*?|->\s*?)(?:\?|\+)?date\b/gi, replace: "$1+Date"},
    {find: /(:\s*?|->\s*?)(?:\?|\+)?object\b/gi, replace: "$1object"},
    {find: /(\[\s*?)(?:\?|\+)?byte(\s*?\])/gi, replace: "$1number$2"},
    {find: /(\[\s*?)(?:\?|\+)?int(\s*?\])/gi, replace: "$1number$2"},
    {find: /(\[\s*?)(?:\?|\+)?integer(\s*?\])/gi, replace: "$1number$2"},
    {find: /(\[\s*?)(?:\?|\+)?long(\s*?\])/gi, replace: "$1number$2"},
    {find: /(\[\s*?)(?:\?|\+)?short(\s*?\])/gi, replace: "$1number$2"},
    {find: /(\[\s*?)(?:\?|\+)?float(\s*?\])/gi, replace: "$1number$2"},
    {find: /(\[\s*?)(?:\?|\+)?double(\s*?\])/gi, replace: "$1number$2"},
    {find: /(\[\s*?)(?:\?|\+)?numeric(\s*?\])/gi, replace: "$1number$2"},
    {find: /(\[\s*?)(?:\?|\+)?number(\s*?\])/gi, replace: "$1number$2"},
    {find: /(\[\s*?)(?:\?|\+)?string(\s*?\])/gi, replace: "$1string$2"},
    {find: /(\[\s*?)(?:\?|\+)?char(\s*?\])/gi, replace: "$1string$2"},
    {find: /(\[\s*?)(?:\?|\+)?date(\s*?\])/gi, replace: "$1+Date$2"},
    {find: /(\[\s*?)(?:\?|\+)?object(\s*?\])/gi, replace: "$1object$2"},
    {find: /^lang\.string$/gi, replace: "string"}
  ];

  function fixupDefinitions(def) {
    if(def && typeof(def) === "object") {
      if(Array.isArray(def))
        return def.map(fixupDefinitions);
      else {
        let result = {};
        for(let key of Object.keys(def)) {
          result[key] = fixupDefinitions(def[key]);
        }
        return result;
      }
    }

    for(let {find, replace} of fixups)
      def = def.replace(find, replace);
    return def;
  }

  function sanitizeDefinitions() {
    definitions = definitions.map(def => {
      let fixed = fixupDefinitions(def);
      if(fixed["!define"]) {
        if("Array" in fixed["!define"])
          delete fixed["!define"]["Array"];
        if("String" in fixed["!define"])
          delete fixed["!define"]["String"];
      }

      return fixed;
    });
  }

  if(!tern || !tern.Server) {
    console.log(...fmtStr`${fmt.redBold}Error: tern is not defined`);
    return;
  }


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
      console.log(...fmtStr`Sanitizing definitions... this might take a while.`);
      sanitizeDefinitions();
      createDownloadButton();
      console.log(...fmtStr`${fmt.greenBold}Done. Please click the download button to download the definition file.`);
    }
    return reset.apply(this, arguments);
  };

  console.log(...fmtStr`Ready. ${fmt.greenBold}Please continue script execution now.`);
})();
