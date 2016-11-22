const router = require('express').Router();
const Query = require('mongo-promise');
const utils = require('../../utils');

router.use(function(req, res, next) {
  if(typeof req.session === 'undefined'
      || !req.session.hasOwnProperty('user') || !req.session.hasOwnProperty('hash'))
    return res.redirect('/');

  next();
});

router.get('/', function(req, res) {
  let options = {};
  options.username = req.session.user.username;

  let db = new Query(utils.config.dbname)
  .query({}, 'newsfeed').exec('count')
  .handle((c) => {
    options.count_newsfeed = c;
  })
  .query({}, 'question').exec('count')
  .handle((c) => {
    options.count_question = c;
  })
  .query({}, 'ebook').exec('count')
  .handle((c) => {
    options.count_ebook = c;
  })
  .close(() => {
    res.render('dashboard/index', options);
  }, (error) => {
    res.render('/404');
  });
});

router.use('/newsfeed', require('./newsfeed'));
router.use('/question', require('./question'));
router.use('/ebook', require('./ebook'));
module.exports = router;
