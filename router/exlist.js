const router = require('express').Router();
const Query = require('mongo-promise');
const utils = require('../utils');
const querystring = require('querystring');

const collection = 'exam';

router.get('/exlist', function(req, res) {
  options = {};

  options.call = 'search({}, 0);';

  if(String(req.url).startsWith('/exlist?'))
  {
    let GET = querystring.parse(req.url.substring(8));
    let level = Number(GET['level']);
    let subject = Number(GET['subject']);
    let year = Number(GET['year']);

    let filter = {};
    if(level !== NaN) filter.level = level;
    if(subject !== NaN) filter.subject = subject;
    if(year !== NaN) filter.year = year;

    options.call = `search(JSON.parse(\`${JSON.stringify(filter)}\`), 0);`;
  }

  res.render('exlist', options);
});

router.post('/exlist', function(req, res) {
  let POST = req.body;
  let limit = utils.config.show.exam;

  let filter = {};
  let options = {};
  let page = 1;
  let opts = {};

  if(typeof POST['filter'] !== 'undefined')
  {
    utils.clonewith(POST['filter'], filter, ['subject', 'level', 'year']);
    for(let i in filter)
      if(filter.hasOwnProperty(i)) filter[i] = Number(filter[i]);
  }

  if(typeof POST['page'] !== 'undefined')
  {
    try {
      page = Math.floor(Number(POST['page']));
      if(page < 1) page = 1;
    }catch(e){}
  }

  options.skip = limit * (page - 1);
  options.sort = {datecreate: -1};

  let db = new Query(utils.config.dbname)
  .query(filter, collection)
  .exec('count')
  .handle((c) => {
    opts.pages = Math.ceil(c / limit);
    opts.curpage = page;
  })
  .find(filter, collection, options)
  .handle((rows) => {
    opts.datas = JSON.stringify(rows);
  })
  .close(()=> {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(opts));
  }, (error)=> {
    console.log(error);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({error}));
  });
});


module.exports = router;
