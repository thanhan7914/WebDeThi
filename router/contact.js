const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;
const Query = require('mongo-promise');
const utils = require('../utils');

router.get('/', function(req, res) {
  res.render('contact');
});

module.exports = router;
