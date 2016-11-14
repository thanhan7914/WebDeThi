const router = require('express').Router();
const Query = require('mongo-promise');
const utils = require('../utils');

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

  let db = new Query(utils.config.dbname)
  .find({}, 'newfeed', {sort: {datecreate: -1}, limit: 3})
  .handle((rows) => {
    options.newfeed = '<table class="table">';
    rows.forEach(function(obj) {
      options.newfeed += `
      <tr>
         <td class="top">
             <a href="#"><img width="200px" src="${obj.image}"></a>
         </td>
         <td style="text-align: left;">
             <a href="#"><p>${obj.title}</p></a>
             <small>${obj.description}</small>
         </td>
      </tr>
      `;
    });

    options.newfeed += '</table>';
  })
  .close()
  .handle(() => {
    res.render('index', options);
  });
});

router.get('/exlist', function(req, res) {
  res.render('exlist');
});

router.use(require('./login'));

module.exports = router;
