'use strict'

const crypto = require('crypto');
const mongo_promise = require('mongo-promise');
let config = require('./config.json');
let entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

String.prototype.escapeHtml = function() {
  return this.replace(/[&<>"'`=\/]/g, function fromEntityMap (s) {
    return entityMap[s];
  });
}
//
if(typeof String.prototype.addslashes === 'undefined')
{
  String.prototype.addslashes = function() {
    return this.replace(/[\\"']/g, '\\$&')
    .replace(/\u0000/g, '\\0');
  }
}

module.exports = {
  _ : {
    isUndefined: function(_var) {
      return typeof _var === 'undefined';
    }
  },
  config,
  secret: 'L1gCZwDdLET5KoJzNq7B',
  encode: function(text, secret, code){
    if(this._.isUndefined(code)) code = 'aes256';
    if(this._.isUndefined(secret)) secret = this.secret;
    const cipher = crypto.createCipher(code, secret);
    let encode = cipher.update(text, 'utf8', 'hex');
    return encode + cipher.final('hex');
  },
  decode: function(encode, secret, code){
    if(this._.isUndefined(code)) code = 'aes256';
    if(this._.isUndefined(secret)) secret = this.secret;
    const decipher = crypto.createDecipher(code, secret);
    let text = decipher.update(encode, 'hex', 'utf8');
    return text + decipher.final('utf8');
  },
  createHash: function(text, code) {
    if(this._.isUndefined(code)) code = 'sha256';
    const hash = crypto.createHash(code);

    hash.update(text);
    return hash.digest('hex');
  },
  createHmac: function(text, secret, code) {
    if(this._.isUndefined(code)) code = 'sha256';
    if(this._.isUndefined(secret)) secret = this.secret;
    const hmac = crypto.createHmac(code, secret);

    hmac.update(text);
    return hmac.digest('hex');
  },
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
  },
  toUrl: function change_alias(str) {
    str= str.toLowerCase();
    str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");
    str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");
    str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i");
    str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ  |ợ|ở|ỡ/g,"o");
    str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");
    str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");
    str= str.replace(/đ/g,"d");
    str= str.replace(/“|”|!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g,"-");
    str= str.replace(/-+-/g,"-"); //thay thế 2- thành 1-
    str= str.replace(/^\-+|\-+$/g,"");

    return str;
  },
  escapeHtml(a, c) {
    if(!(c instanceof Array)) c = [];
    for(let i in a)
      if(a.hasOwnProperty(i) && c.indexOf(i.toString()) !== -1) a[i] = a[i].escapeHtml();
  }
};
