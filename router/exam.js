const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;
const Query = require('mongo-promise');
const utils = require('../utils');

router.get('/exam/([a-zA-Z0-9_\-]+)\.([a-z0-9]{24})', function(req, res) {
  let id = req.url.substring(req.url.lastIndexOf('.') + 1);
  let options = {};

  res.render('exam')
});

module.exports = router;
