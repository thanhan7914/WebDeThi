const express = require('express');
const Query = require('mongo-promise');
const ObjectID = require('mongodb').ObjectID;
const querystring = require('querystring');
const utils = require('../../utils');

class Views {
  constructor (collection, renderFile, postUrl, config) {
    this.router = express.Router();
    this.postUrl = postUrl;
    this.renderFile = renderFile;
    this.collection = collection;
    this.config = config;
    this.router.get('*', this.getAllHandle.bind(this));
    this.router.get('/', this.getHandle.bind(this));
    this.router.post('/', this.postHandle.bind(this));
  }

  getAllHandle(req, res, next) {
    if(req.url === '/') return next();
    if(req.url === this.postUrl)
      return this.renderNewPost(req, res);

    let GET = querystring.parse(req.url.substring(2));
    if(typeof GET['page'] !== 'undefined')
    {
      req.body.page = GET['page'];
      return next();
    }

    if(typeof GET['method'] === 'undefined'
       && typeof GET['id'] === 'undefined' && GET['hash'] !== req.session.hash)
      return res.redirect('/404');

    let id = GET['id'];
    let self = this;

    if(GET['method'] === 'delete')
    {
      let ids = id.split(',');
      let db = new Query(utils.config.dbname);
      ids.forEach(function(idx) {
        db.remove({_id: new ObjectID(idx)}, self.collection);

        if(typeof self.delHandle === 'function')
          self.delHandle(db, idx);
      });

      return db.close(() => {
        res.redirect('/' + self.renderFile);
      }, (error) =>{
        res.end(error);
      });
    }

    if(GET['method'] === 'edit')
    {
      let options = {
        method: GET['method'],
        post_id: id,
        username: req.session.user.username,
        hash: req.session.hash
      };

      let db = new Query(utils.config.dbname)
      .find({_id: new ObjectID(id)}, self.collection);
      db.line = db.line.then((rows) => {
        if(rows.length === 0) throw new Error('Not found');

        return self.editPost(options, rows[0]);
      });

      return db.close(() => {
        self.renderNewPost(req, res, options);
      }, (error) => {
        res.end(error);
      });
    }

    return res.end(GET['method']);
  }

  getHandle(req, res) {
    let options = {
      username: req.session.user.username,
      hash: req.session.hash
    };

    let count, skip = 0, limit;
    let self = this;

    try {
      limit = self.config.limit;
      if(typeof req.body.page !== 'undefined')
        skip = Math.floor((parseInt(req.body.page) - 1) * limit);
      else req.body.page = 1;

      if(skip < 0) skip = 0;
    }catch(e){}

    let db = new Query(utils.config.dbname);
    db.query({}, self.collection)
    .exec('count')
    .handle((c) => {
      count = c;
      if(skip > c) throw new Error('Page not found.');
    })
    .find({}, self.collection, {sort: {datecreate: -1}, skip, limit})
    .handle((docs) => {
      //query
      let len = docs.length;
      options.pages = Math.ceil(count / limit);
      options.curpage = req.body.page;
      options.count_posts = (len + skip) + '/' + count;
      options.posts = self.wrapPosts(docs);
    })
    .close((done) => {
      res.render(self.renderFile, options);
    }, (error) => {
      res.redirect(error);
    });
  }

  postHandle(req, res) {
    return res.render(this.renderFile);
  }

  wrapPosts(docs) {
    return '';
  }

  renderNewPost(req, res, options) {
    res.render(this.renderFile);
  }

  editPost(options, row) {
    return options;
  }

  get Router() {
    return this.router;
  }
};

module.exports = Views;
