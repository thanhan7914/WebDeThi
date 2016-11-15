const router = require('express').Router();
const Query = require('mongo-promise');
const utils = require('../utils');

router.get('/readnews', function(req, res) {
  res.render('readnews');
});

module.exports = router;
