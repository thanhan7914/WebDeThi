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
      if(i === 0)
      {
        options.topnews = `
        <div class="news-body-main">
          <div class="images-news">
            <a href="readnews">
              <img class="img-responsive" src="${rows[i].image}" alt="${rows[i].title}" />
            </a>
          </div>

          <div class="images-news-title">
            <h4><a href="readnews">${rows[i].title}</a></h4>
          </div>

          <div class="images-new-describle">
            <small style="color:#888">${rows[i].description}</small>
          </div>
        </div>
        `;
      }
      else
      {
        options.news += `
        <div class="row news-row">
            <div class="col-md-4">
              <div class="news-row-img">
                <a href="#"><img width="200" src="${rows[i].image}" alt="${rows[i].title}" /></a>
              </div>
            </div>
            <div class="col-md-8">
              <div class="news-row-box">
                <div class="news-row-title">
                  <a href="#"><h4>${rows[i].title}</h4></a>
                </div>
                <div class="news-row-content">
                  <p style="color:#888">
                    ${rows[i].description}
                  </p>
                </div>
              </div>
            </div>
        </div>
        `;
      }
    }
  })
  .find({}, 'newsfeed', {sort: {datecreate: -1}, limit: 2})
  .handle((rows) => {
    options.newest = '';

    rows.forEach((row, id) => {
      options.newest += `
      <div class="row _news-row-slider">
        <div class="col-md-4">
          <div class="_news-row-slider-img">
            <a href="#newslist">
              <img src="${row.image}" alt="${row.title}" width="138" />
            </a>
          </div>
        </div>
        <div class="col-md-8">
          <div class="_news-row-slider-title">
            <a href="#newslist">
              <p>${row.title}</p>
            </a>
          </div>
        </div>
      </div>
      `;
    });
  })
  .close(() => {
    res.render('newslist', options);
  }, (error) => {
    res.render('newslist', {});
  });
});

module.exports = router;
