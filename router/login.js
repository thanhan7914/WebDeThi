const router = require('express').Router();
const Query = require('mongo-promise');
const utils = require('../utils');

router.all('/login', function(req, res, next) {
  if(typeof req.session !== 'undefined' && req.session.hasOwnProperty('user'))
    return res.redirect('/dashboard');

  return next();
});

router.get('/login', function(req, res) {
  res.render('login');
});

router.post('/login', function(req, res) {
  if(!utils.hasattr(req.body, ['username', 'password']))
    return res.render('login');

  let user = {
    username: req.body.username,
    password: utils.createHash(req.body.password)
  };

  let db = new Query(utils.config.dbname);
  db.find(user, 'user')
  .handle((docs) => {
    if(docs.length !== 1)
      throw new Error('No User');

    req.session.user = docs[0];
    req.session.hash = utils.createHash(docs[0].username
      + docs[0].password + utils.rhex(10));
    res.redirect('dashboard');
  })
  .except((error) => {
    console.log(error);
    res.render('login');
  })
  .close();
});

module.exports = router;
