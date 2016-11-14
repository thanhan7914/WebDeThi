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
    if(rows.length < 1) return;
    options.newfeed = `
      <div class="col-md-6">
        <a href="#"><img class="img-news" src="${rows[0].image}"></a>
        <p class="ipnews">${rows[0].title}</p>
      </div>
      <div class="col-md-6">
        <table class="table">
    `;

    for(let i = 1; i < rows.length; i++)
       options.newfeed += `
        <tr>
           <td class="top">
               <a href="#"><img width="200px" src="${rows[i].image}"></a>
           </td>
           <td style="text-align: left;">
               <a href="#"><p>${rows[i].title}</p></a>
               <small>${rows[i].description}</small>
           </td>
        </tr>
        `;

    options.newfeed += '</table></div>';
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
