const router = require('express').Router();
const Query = require('mongo-promise');
const utils = require('../utils');

router.get('/newslist', function(req, res) {
  res.render('newslist');
});

module.exports = router;
