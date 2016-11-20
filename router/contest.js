const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;
const Query = require('mongo-promise');
const utils = require('../utils');

router.get('/contest', function(req, res) {
  res.render('contest')
});

module.exports = router;
