const router = require('express').Router();
const Query = require('mongo-promise');
const ObjectID = require('mongodb').ObjectID;
const querystring = require('querystring');
const utils = require('../../utils');

let newposts = function(req, res, options) {
  res.render('dashboard/newposts', options || {
    method: 'addnew',
    title: '',
    content: '',
    description: '',
    image: '',
    newsfeedid: '',
    username: req.session.user.username,
    hash: req.session.hash
  });
};

router.get('*', function(req, res, next) {
  if(req.url === '/') return next();
  if(req.url === '/?newposts')
    return newposts(req, res);

  let GET = querystring.parse(req.url.substring(2));
  if(typeof GET['page'] !== 'undefined')
  {
    req.body.page = GET['page'];
    return next();
  }

  if(typeof GET['method'] === 'undefined' && typeof GET['id'] === 'undefined')
    return res.redirect('/404');

  let id = GET['id'];
  if(GET['method'] === 'delete' && GET['hash'] === req.session.hash)
  {
    ids = id.split(',');
    let db = new Query(utils.config.dbname);
    ids.forEach(function(idx) {
      db.remove({_id: new ObjectID(idx)}, 'newsfeed');
    });

    return db.close(() => {
      return res.redirect('/dashboard/newsfeed');
    }, (error) =>{
      return res.end(error);
    });
  }

  let options = {};
  options.method = GET['method'];
  options.newsfeedid = id;
  options.username = req.session.user.username;
  options.hash = req.session.hash;

  let db = new Query(utils.config.dbname)
  .find({_id: new ObjectID(id)}, 'newsfeed')
  .handle((rows) => {
    if(rows.length === 0) throw new Error('Not found');

    utils.clonewith(rows[0], options, ['title', 'description', 'content', 'image']);
    utils.escapeHtml(options, ['title', 'description', 'content', 'image']);

    if(GET['method'] === 'edit')
      newposts(req, res, options);
    else
      res.end(GET['method']);
  })
  .except((error) => {
    res.redirect('/404');
  })
  .close();
});

router.get('/', function(req, res) {
  let options = {
    username: req.session.user.username,
    hash: req.session.hash
  };

  let count, skip = 0, limit;
  try {
    limit = utils.config.dashboard.newsfeed.limit;
    if(typeof req.body.page !== 'undefined')
      skip = Math.floor((parseInt(req.body.page) - 1) * limit);
    else req.body.page = 1;

    if(skip < 0) skip = 0;
  }catch(e){}

  let db = new Query(utils.config.dbname);
  db.query({}, 'newsfeed')
  .exec('count')
  .handle((c) => {
    count = c;
    if(skip > c) throw new Error('Page not found.');
  })
  .find({}, 'newsfeed', {sort: {datecreate: -1}, skip, limit})
  .handle((docs) => {
    //query
    let len = docs.length;
    options.pages = Math.ceil(count / limit);
    options.curpage = req.body.page;
    options.count_news_feed = (len + skip) + '/' + count;
    options.news = '';

    for(let i = 0; i < len; i++)
    {
      let href = `/readnews/${utils.toUrl(docs[i].title)}.${docs[i]._id}`;

      options.news += `
          <div class="news">
            <p><input type="checkbox" style="display: inline; margin: auto 6px;"><a href="${href}" target="_blank">${docs[i].title}</a></p>
            <small><b>${docs[i].description}</b></small>
            <div class="tools"><a href="?method=edit&id=${docs[i]._id}">Edit</a>|<a href="?method=delete&id=${docs[i]._id}">Delete</a></div>
          </div>
      `;
    }
  })
  .close((done) => {
    res.render('dashboard/newsfeed', options);
  }, (error) => {
    res.redirect('/404');
  });
});

router.post('/', function(req, res) {
  let POST = req.body;

  if(req.url === '/?newposts')
  {
    if(typeof POST['method'] === 'undefined' && POST['hash'] !== req.session.hash)
      return res.redirect('/dashboard/newsfeed');

    if(POST['method'] === 'addnew' || POST['method'] === 'edit')
    {
      if(!utils.hasattr(POST, ['title', 'content', 'description', 'image']))
        return res.redirect('/dashboard/newsfeed');

      let row = {datecreate: Date.now(), dateupdate: Date.now(), author: req.session.user.username};
      utils.clonewith(POST, row, ['title', 'content', 'description', 'image']);

      let db = new Query(utils.config.dbname);
      if(POST['method'] === 'addnew')
        db.insert(row, 'newsfeed');
      else if(POST['method'] === 'edit' && POST['newsfeedid'].length === 24)
      {
        db.find({_id: new ObjectID(POST['newsfeedid'])}, 'newsfeed')
        .handle((docs) => {
          if(docs.length === 0) throw new Error('Not found');

          row.datecreate = docs[0].datecreate;
        })
        .update({_id: new ObjectID(POST['newsfeedid'])}, row, 'newsfeed');
      }

      db.close(() => {
        res.redirect('/dashboard/newsfeed');
      }, (error) => {
        console.log(error);
        res.redirect('/404');
      });
    }
  }
  else
    res.redirect('/dashboard/newsfeed');
});

module.exports = router;