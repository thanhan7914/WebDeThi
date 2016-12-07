const router = require('express').Router();
const Query = require('mongo-promise');
const utils = require('../utils');

router.use(function(req, res, next) {
  if(typeof req.session !== 'undefined'
   && typeof req.session.hex === 'undefined')
     req.session.hex = utils.rhex(12);

  next();
});

router.get('/', function(req, res) {
  let options = {
    login: `
    <a href="#" data-toggle="modal" data-target="#myModal">Đăng nhập</a>
    `
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
  .find({}, 'newsfeed', {sort: {datecreate: -1}, limit: 3})
  .handle((rows) => {
    if(rows.length < 1) return;
    options.newsfeed = `
      <div class="col-md-6" style="max-height: 320px;">
        <div class="img-news">
          <a href="/readnews/${utils.toUrl(rows[0].title)}.${rows[0]._id}"><img src="${rows[0].image}" alt="${rows[0].title}"></a>
        </div>
        <div class="ipnews">
          <p><a href="/readnews/${utils.toUrl(rows[0].title)}.${rows[0]._id}">${rows[0].title}</a></p>
        </div>
      </div>
      <div class="col-md-6">
    `;

    for(let i = 1; i < rows.length; i++)
    {
      let href = `/readnews/${utils.toUrl(rows[i].title)}.${rows[i]._id}`;

       options.newsfeed += `
       <div class="row newsfeed">
         <div class="newsfeed-left">
           <div class="newsfeed-left img-news img-newsfeed">
             <a href="${href}"><img src="${rows[i].image}"></a>
           </div>
        </div>
         <div class="newsfeed-right">
             <a href="${href}"><p>${rows[i].title}</p></a>
             <small>${rows[i].description}</small>
         </div>
       </div>
        `;
    }

    options.newsfeed += '</div>';
  })
  .find({}, 'ebook', {sort: {datecreate: -1}, limit: 8})
  .handle((rows) => {
    if(rows.length < 1) return;
    options.ebook = '<div class="row">';
    let len = rows.length;
    for(let i = 0; i < len; i++)
    {
      let href = `/ebook/${utils.toUrl(rows[i].title)}.${rows[i]._id}`;
      if(i % 4 === 0 && i > 0)
        options.ebook += '</div><div class="row">';

      options.ebook += `
      <div class="col-md-3">
          <div class="item1"><a href="${href}"><img class="img-responsive" src="${rows[i].image || 'assets/images/thumb11_116304587.png'}"></a></div>
          <div class="item1-title"><p><a href="${href}">${rows[i].title}</a></p></div>
       </div>
      `;
    }

    options.ebook += '</div>';
  })
  .find({}, 'exam', {sort: {datecreate: -1}, limit: 8})
  .handle((rows) => {
    if(rows.length < 1) return;
    options.examination = '<div class="row">';
    let len = rows.length;
    for(let i = 0; i < len; i++)
    {
      let href = `/exam/${utils.toUrl(rows[i].title)}.${rows[i]._id}`;
      let title = rows[i].title;
      if(title.length > 62) title = title.substring(0, 62) + '...';

      if(i % 4 === 0 && i > 0)
        options.examination += '</div><div class="row">';

      options.examination += `
      <div class="col-md-3">
          <div class="item1"><a href="${href}"><img class="img-responsive" src="${rows[i].image || 'assets/images/thumb11_116304587.png'}"></a></div>
          <div class="item1-title"><p><a href="${href}">${title}</a></p></div>
       </div>
      `;
    }

    options.examination += '</div>';
  })
  .close()
  .handle(() => {
    res.render('index', options);
  });
});

router.get('/logout', function(req, res) {
  delete req.session.user;
  delete req.session.hash;

  res.redirect('/');
});

router.use(require('./login'));
router.use(require('./readnews'));
router.use(require('./exlist'));
router.use(require('./newslist'));
router.use(require('./ebook'));
router.use(require('./exam'));
router.use(require('./contest'));
router.use('/contact', require('./contact'));
router.use('/score', require('./score'));
router.use('/answer', require('./answer'));

module.exports = router;
