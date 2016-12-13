const router = require('express').Router();
const Query = require('mongo-promise');
const ObjectID = require('mongodb').ObjectID;
const querystring = require('querystring');
const utils = require('../../utils');

router.get('/', function(req, res) {
  res.render('dashboard/setting', {
    username: req.session.user.username,
    hash: req.session.hash
  });
});

module.exports = router;
