const router = require('express').Router();
const Query = require('mongo-promise');
const utils = require('../../utils');

router.get('/', function(req, res) {
  let options = {};
  options.username = req.session.user.username;

  res.render('dashboard/question', options);
});

module.exports = router;
