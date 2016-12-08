const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;
const Query = require('mongo-promise');
const utils = require('../utils');
const querystring = require('querystring');

router.get('/ebook/([a-zA-Z0-9_\-]+)\.([a-z0-9]{24})', function(req, res) {
  let id = req.url.substring(req.url.lastIndexOf('.') + 1);
  let options = {};

  let db = new Query(utils.config.dbname)
  .find({_id: new ObjectID(id)}, 'ebook')
  .handle((rows) => {
    if(rows.length === 0) throw new Error('not found');

    utils.clonewith(rows[0], options, ['title', 'content', 'datecreate', 'description', 'author']);
  })
  .except((error) => {
    console.log(error);
  })
  .close()
  .handle(() => {
    options.datecreate = (new Date(options.datecreate)).toString();
    res.render('ebook', options);
  });
});

router.get('/ebook', function(req, res) {
  let page = 1;
  let options = {};
  let limit = utils.config.show.ebook;
  let collection = 'ebook';

  if(String(req.url).startsWith('/ebook?'))
  {
    let GET = querystring.parse(req.url.substring(7));
    page = Math.floor(Number(GET['page']));
  }

  let db = new Query(utils.config.dbname)
  .query({}, collection)
  .exec('count')
  .handle((c) => {
    options.pages = Math.ceil(c / limit);
    options.curpage = page;
  })
  .find({}, collection, {sort: {datecreate: -1}, skip: limit * (page - 1), limit})
  .handle((rows) => {
    options.datas = JSON.stringify(rows);
  })
  .close(()=> {
    res.render('ebooklist', options);
  }, (error)=> {
    console.log(error);
    res.redirect('/404');
  });
});

module.exports = router;
