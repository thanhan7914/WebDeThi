'use strict'

if(typeof String.prototype.addslashes === 'undefined')
{
  String.prototype.addslashes = function() {
    return this.replace(/[\\"']/g, '\\$&')
    .replace(/\u0000/g, '\\0');
  }
}

module.exports = {
  inherit: function(a, b) {
    for(let i in a)
      if(a.hasOwnProperty(i)) b[i] = a[i];
  },
  override:  function(a, b) {
    for(let i in a)
      if(a.hasOwnProperty(i) && !b.hasOwnProperty(i)) b[i] = a[i];
  },
  deepclone: function(a, b, c) {
    if(!(c instanceof Array)) c = [];
    for(let i in a)
      if(a.hasOwnProperty(i) && c.indexOf(i.toString()) === -1)
      {
        if(a[i] instanceof Array) b[i] = a[i];
        else if(typeof a[i] === 'object')
        {
          if(!b.hasOwnProperty(i)) b[i] = {};
          this.deepclone(a[i], b[i]);
        }
        else b[i] = a[i];
      }
  },
  clonewith: function(a, b, c) {
    if(!(c instanceof Array)) c = [];
    for(let i in a)
      if(a.hasOwnProperty(i) && c.indexOf(i.toString()) !== -1) b[i] = a[i];
  },
  clonewithout: function(a, b, c) {
    if(!(c instanceof Array)) c = [];
    for(let i in a)
      if(a.hasOwnProperty(i) && c.indexOf(i.toString()) === -1) b[i] = a[i];
  },
  htmlentities: function(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
  hasattr: function(obj, attr) {
    if(typeof obj['hasOwnProperty'] === 'undefined') throw '##obj has not attribute hasOwnProperty.';
    if(typeof attr === 'string') return obj.hasOwnProperty(attr);
    if(attr instanceof Array)
    {
      let un = true;
      for(let i of attr)
        if(!(un = obj.hasOwnProperty(i))) break;

      return un;
    }

    throw 'variable ##attr invalid';
  },
  _typeof: function(variable) {
    if(variable instanceof Array) return 'array';
    if(variable instanceof Promise) return 'promise';
    return (typeof variable).toString();
  },
  hastype: function(obj, types) {
    let un = true;
    for(let i in types)
      if(!(un = (obj.hasOwnProperty(i) && (this._typeof(obj[i]) === types[i])))) break;

    return un;
  }
};
