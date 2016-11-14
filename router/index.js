const router = require('express').Router();

router.get('/', function(req, res) {
  let options = {};

  if(typeof req.session !== 'undefined' && req.session.hasOwnProperty('user'))
    options.username = req.session.user.username;

  res.render('index', options);
});

router.use(require('./login'));

module.exports = router;
