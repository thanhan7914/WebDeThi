const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;
const Query = require('mongo-promise');
const utils = require('../utils');

router.get('/readnews/([a-zA-Z0-9_\-]+)\.([a-z0-9]{24})', function(req, res) {
  let id = req.url.substring(req.url.lastIndexOf('.') + 1);
  let options = {};

  let db = new Query(utils.config.dbname)
  .find({_id: new ObjectID(id)}, 'newsfeed')
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
    res.render('readnews', options);
  });
});

module.exports = router;
