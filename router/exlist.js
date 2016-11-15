const router = require('express').Router();
const Query = require('mongo-promise');
const utils = require('../utils');

router.get('/exlist', function(req, res) {
  res.render('exlist');
});

module.exports = router;
