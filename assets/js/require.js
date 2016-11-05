((function __main__(require, ready, dependence, delay) {
  this.ready = ready;
  this.dependence = dependence;
  this.require = require.bind(null);
  this.delay = delay;
}).call(window, function require(context, filename, ...oths) {
  function basename(filename) {
    let pos;
    if((pos = filename.lastIndexOf('/')) !== -1) filename = filename.substring(pos + 1);
    filename = filename.replace(/[^A-Za-z0-9_]/g, '_');
    if((pos = filename.lastIndexOf('_')) !== -1) return filename.substring(0, pos);
    return filename;
  }

  function readfile(filename, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', filename, true);
    xhr.onload = function (e) {
      if (xhr.readyState === 4)
      {
        if (xhr.status === 200)
          callback(xhr.responseText);
        else
          throw xhr.statusText;
      }
    };

    xhr.onerror = function (e) {
      throw xhr.statusText;
    };

    xhr.send(null);
  }

  function readPromise(filename) {
    return new Promise(function(r, rj) {
      readfile(filename, function(jsContent) {
        r(jsContent);
      });
    });
  }

  readfile(filename, function(jsContent) {
    if(oths.length === 0 || typeof oths[0] === 'function')
    {
      context[basename(filename)] = function() {
        eval(jsContent);
      }

      context[basename(filename)].call(context);

      if(typeof oths[0] === 'function')
        oths[0]();

      return;
    }

    let content = jsContent;
    let proc = readPromise(oths[0])
    .then(function(_jsContent) {
      content += '\n';
      content += _jsContent;
      return;
    });

    for(let i = 1; i < oths.length; i++)
      proc = proc.then(function() {
        readPromise(oths[0])
        .then(function(_jsContent) {
          content += '\n';
          content += _jsContent;
          return;
        });
      });

    proc.then(function() {
      new Function(content).call(context);
    })
    .catch(function(err) {
      console.error(err);
    });
  });
}, (function ready(__ready__) {
  if (document.readyState != 'loading')
    __ready__();
  else
    document.addEventListener('DOMContentLoaded', __ready__);
}).bind(window), function dependence(callback, ...oths) {
  let un = true;
  for(let i = 0; i < oths.length; i++)
    if(!(un = this.hasOwnProperty(oths[i]))) break;

  if(!un) return setTimeout(dependence.bind(this, callback, ...oths), 100);
  callback();
}, function delay(millisecond) {
  let mark = new Date().getTime();
  for(let i = 0; i < 1e7 && new Date().getTime() - mark < millisecond; i++);
}));
