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
  let options = {
    username: req.session.user.username,
    system: JSON.stringify(utils.system),
    config: JSON.stringify({
      dashboard: {
        newsfeed: utils.config.dashboard.newsfeed.limit,
        exam: utils.config.dashboard.exam.limit,
        ebook: utils.config.dashboard.ebook.limit
      },
      show: {
        newsfeed: utils.config.show.newsfeed,
        exam: utils.config.show.exam,
        ebook: utils.config.show.ebook
      }
    })
  };

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
  .find({}, 'counter')
  .handle((rows) => {
    let counter = 0;
    rows.forEach((row) => {
      counter += row.count;
    });

    options.counter = counter;
  })
  .find({}, 'online')
  .handle((rows) => {
    options.online = JSON.stringify(rows);
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
router.use('/restore', require('./restore'));
router.use('/backup', require('./backup'));
router.use('/setting', require('./setting'));

module.exports = router;
