'user strict';

const fs = require('fs');
const path = require('path');

exports.cache = {};
exports.root = __dirname;
exports.views = '../views';
exports.ext = 'eng';

let readFile = function(fileName, options)
{
  if(!fileName.endsWith(exports.ext)) fileName += '.' + exports.ext;
  if(exports.cache[fileName]) return exports.compile(exports.cache[fileName], options);
  let str = fs.readFileSync(fileName, 'utf8');
  str = include(str);//join
  let templ = exports.compile(str, options);
  //#cover to design ui
//  exports.cache[fileName] = str;
  return templ;
}

let include = function(str)
{
  let partial = str.split(/<include filename=([A-Za-z0-9\/\\\.]*)(\soptions=\'([^\']*)\')?>/g);
  for(let i = 1; i < partial.length; i += 4)
  {
    if(typeof partial[i + 2] === "undefined")
      partial[i] = readFile(`${exports.root}/${exports.views}/${partial[i]}`, {}, false);
    else
      partial[i] = readFile(`${exports.root}/${exports.views}/${partial[i]}`, JSON.parse(partial[i + 2]), false);

    partial[i + 1] = '';
    partial[i + 2] = '';
  }

  return partial.join('');
}

exports.compile = function(str, options)
{
  if(options instanceof Object)
  {
    for(let key in options)
    {
      let content = options[key];
      if(!options.hasOwnProperty(key)) continue;
      if(options[key] instanceof Object || options[key] instanceof Array)
         content = JSON.stringify(options[key]);

      let reg = new RegExp('<eng data=' + String(key) + '>','g');
      if(reg.test(str))
        str = str.replace(reg, String(content));
    }
  }

  return str;
}

exports.renderFile = function(fileName, options, callback)
{
  let templ = readFile(fileName, options);
  return callback(null, templ);
}

exports.__engine__ = function(filePath, options, callback)
{
  return exports.renderFile(filePath, options, callback);
}
