const router = require('express').Router();
const Query = require('mongo-promise');
const utils = require('../utils');
const querystring = require('querystring');

router.get('/newslist', function(req, res) {
  let page = 1;
  let limit = utils.config.show.newsfeed;
  let options = {};
  try {
    if(String(req.url).startsWith('/newslist?'))
      page = Math.floor(parseInt(querystring.parse(req.url.substring(10))['page']));
  }catch(e){}

  let db = new Query(utils.config.dbname)
  .query({}, 'newsfeed')
  .exec('count')
  .handle((c) => {
    options.pages = Math.ceil(c / limit);
    options.curpage = page;
  })
  .find({}, 'newsfeed', {sort: {datecreate: -1}, skip: limit * (page - 1), limit})
  .handle((rows) => {
    options.news = '';

    for(let i = 0; i < rows.length; i++)
    {
      let href = `/readnews/${utils.toUrl(rows[i].title)}.${rows[i]._id}`;

      options.news += `
        <div class="row" style="padding: 4px 2px; border-top: 1px solid #eee;">
          <div class="col-md-4">
            <div class="img-news img-newsfeed" style="width: 100%">
              <a href="${href}"><img src="${rows[i].image}"></a>
            </div>
         </div>
          <div class="col-md-8">
              <a href="${href}"><p>${rows[i].title}</p></a>
              <small><strong>${rows[i].description}</strong></small>
          </div>
        </div>
      `;
    }
  })
  .close(() => {
    res.render('newslist', options);
  }, (error) => {
    res.render('newslist', {});
  });
});

module.exports = router;
