const router = require('express').Router();

router.get('/', function(req, res) {
  let options = {
    login: `
    <a href="#" data-toggle="modal" data-target="#myModal">Đăng nhập</a> |
    <a href="#">Đăng ký</a>`
  };

  if(typeof req.session !== 'undefined' && req.session.hasOwnProperty('user'))
  {
    options.username = req.session.user.username;
    options.login = `
        Xin chào <span style="color: blue;">${req.session.user.username}</span> |
        <a href="/dashboard">Dashboard</a>
    `;
  }

  res.render('index', options);
});

router.get('/exlist', function(req, res) {
  res.render('exlist');
});

router.use(require('./login'));

module.exports = router;
