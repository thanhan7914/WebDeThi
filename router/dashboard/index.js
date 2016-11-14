const router = require('express').Router();
const Query = require('mongo-promise');
const utils = require('../../utils');

router.use(function(req, res, next) {
  if(typeof req.session === 'undefined' || !req.session.hasOwnProperty('user'))
    return res.redirect('/');

  next();
});

router.get('/', function(req, res) {
  let options = {};
  options.username = req.session.user.username;

  res.render('dashboard/index', options);
});

router.use('/newfeed', require('./newfeed'));
router.use('/question', require('./question'));
module.exports = router;
