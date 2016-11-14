const router = require('express').Router();
const Query = require('mongo-promise');
const utils = require('../../utils');

let newposts = function(req, res) {
  res.render('dashboard/newposts');
};

router.get('/', function(req, res) {
  if(req.url === '/?newposts')
    return newposts(req, res);

  let options = {username: req.session.user.username};

  let count, skip = 0, limit;
  try {
    limit = utils.config.dashboard.newfeed.limit;
    if(typeof req.body.page !== 'undefined')
      skip = Math.floor((parseInt(req.body.page) - 1) * limit);

    if(skip < 0) skip = 0;
  }catch(e){}

  let db = new Query(utils.config.dbname, true);
  db.query({}, 'newfeed')
  .exec('count')
  .handle((c) => {
    count = c;
    if(skip >= c) throw new Error('Page not found.');
  })
  .find({}, 'newfeed', {sort: {datecreate: -1}, skip, limit})
  .handle((docs) => {
    //query
    let len = docs.length;
    options.news = '';

    for(let i = 0; i < len; i++)
      options.news += `
          <div class="news">
            <p><input type="checkbox" style="display: inline; margin: auto 6px;"><a href="#">${docs[i].title}</a></p>
            <small><b>${docs[i].content}</b></small>
            <div class="tools"><a href="">Edit</a>|<a href="">Delete</a></div>
          </div>
      `;
  })
  .except((error) => {
    //error
  })
  .close()
  .handle((done) => {
    res.render('dashboard/newfeed', options);
  });
});

module.exports = router;
