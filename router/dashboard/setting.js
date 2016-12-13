const router = require('express').Router();
const Query = require('mongo-promise');
const ObjectID = require('mongodb').ObjectID;
const querystring = require('querystring');
const utils = require('../../utils');

let getNum = function(a, c, b) {
  if(typeof b == 'undefined') return;
  let d = Number(b);
  if(d !== NaN)
    a[c] = d;
}

router.use(function(req, res, next) {
  if(req.session.user.level > 0)
    return res.redirect('/403');
  next();
});

router.get('/setting', function(req, res) {
  console.log(utils.config);
  let options = {
    username: req.session.user.username,
    hash: req.session.hash
  };

  new Query(utils.config.dbname)
  .find({}, 'user')
  .handle(function(users) {
    options.users = users;
    options.d_newsfeed = utils.config.dashboard.newsfeed.limit;
    options.d_ebook = utils.config.dashboard.ebook.limit;
    options.d_exam = utils.config.dashboard.exam.limit;
    options.newsfeed = utils.config.show.newsfeed;
    options.ebook = utils.config.show.ebook;
    options.exam = utils.config.show.exam;
    options.tconline = utils.config.tconline;
  })
  .close()
  .join(() => {
    res.render('dashboard/setting', options);
  });
});

router.post('/setting', function(req, res) {
  let POST = req.body;

  if(POST['hash'] !== req.session.hash) return res.redirect('/404');

  try {
    getNum(utils.config.dashboard.newsfeed, 'limit', POST['d_newsfeed']);
    getNum(utils.config.dashboard.ebook, 'limit', POST['d_ebook']);
    getNum(utils.config.dashboard.exam, 'limit', POST['d_exam']);
    getNum(utils.config.show, 'newsfeed', POST['newsfeed']);
    getNum(utils.config.show, 'ebook', POST['ebook']);
    getNum(utils.config.show, 'exam', POST['exam']);
    getNum(utils.config, 'tconline', POST['tconline']);
  }
  catch(e){
  }

  res.redirect('/dashboard/setting');
});

router.post('/changepass', function(req, res) {
  let POST = req.body;
  let username = req.session.user.username;

  if(POST['hash'] !== req.session.hash) return res.redirect('/404');

  if(!utils.hasattr(POST, ['opass', 'pass', 'rpass']))
    return res.redirect('/404');
  if(POST['pass'] !== POST['rpass'] || POST['pass'].length < 8)
    return res.redirect('/404');

  try {
    let user = {
      password: utils.createHash(POST['pass']),
      username
    };

    new Query(utils.config.dbname)
    .find({username, password: utils.createHash(POST['opass'])}, 'user')
    .handle((docs) => {
      if(docs.length !== 1) throw Error('no user');

      user.level = docs[0].level;
    })
    .update({username}, user, 'user')
    .close()
    .join(() => {
      res.redirect('/logout');
    })
    .except((error) => {
      console.log(error);
      res.redirect('/404');
    });
  }catch(e){
    console.log(e);
    res.redirect('/404');
  }
});

router.post('/createuser', function(req, res) {
  let POST = req.body;

  if(POST['hash'] !== req.session.hash) return res.redirect('/404');

  if(!utils.hasattr(POST, ['username', 'pass', 'rpass', 'level']))
    return res.redirect('/404');
  if(POST['pass'] !== POST['rpass'] || POST['pass'].length < 8 || POST['username'].length <= 3)
    return res.redirect('/404');

  let user = {
    username: POST['username'],
    password: utils.createHash(POST['pass']),
    level: Number(POST['level'])
  };

  new Query(utils.config.dbname)
  .find({username: POST['username']}, 'user')
  .handle((docs) => {
    if(docs.length !== 0) throw Error('has user');
  })
  .insert(user, 'user')
  .close()
  .join(() => {
    res.redirect('/dashboard/setting');
  })
  .except((error) => {
    console.log(error);
    res.redirect('/404');
  });
});

router.get('/removeuser', function(req, res) {
  if(req.url === '/removeuser') return res.redirect('/404');

  try {
    let GET = querystring.parse(req.url.substring('/removeuser?'.length));
    if(GET['hash'] !== req.session.hash
       || GET['user'].length !== 24) return res.redirect('/404');

    let id = new ObjectID(GET['user']);
    new Query(utils.config.dbname)
    .remove({_id: id}, 'user')
    .close()
    .join(() => {
      res.redirect('/dashboard/setting');
    })
    .except((error) => {
      console.log(error);
      res.redirect('/404');
    });
  }catch(e){
    console.log(e);
    res.redirect('/404');
  }
});

module.exports = router;
