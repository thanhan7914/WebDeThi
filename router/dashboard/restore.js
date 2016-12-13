const router = require('express').Router();
const Query = require('mongo-promise');
const ObjectID = require('mongodb').ObjectID;
const querystring = require('querystring');
const utils = require('../../utils');

let insert = function(datas, collection) {
  new Query(utils.config.dbname)
  .insert(datas, collection)
  .close();
}

let jInsert = function(json, attr, collection) {
  let datas = JSON.parse(json);

  if(datas instanceof Array)
  {
    let ndatas = [];

    datas.forEach((data, idx) => {
      if(utils.hasattr(data, attr))
      {
        let f = {};
        utils.clonewithout(data, f, ['_id']);
        ndatas.push(f);
      }
    });

    insert(ndatas, collection);
  }
  else if(typeof datas === 'object')
  {
    if(!utils.hasattr(datas, attr))
      throw Error('not attr');

    let ndatas = {};
    utils.clonewithout(datas, ndatas, ['_id']);
    insert(ndatas, collection);
  }

  return true;
}

let qInsert = function(data) {
  if(typeof datas !== 'object') throw Error('not object');
  if(data.type === 1)
    return jInsert(JSON.stringify(data), ['title', 'subject', 'level', 'year', 'type', 'datecreate', 'question_file'], 'exam');
  if(!utils.hasattr(datas, ['title', 'subject', 'level', 'year', 'type', 'datecreate', 'count', 'questions'])) throw Error('not attr');

  if(!(data.questions instanceof Array)) throw Error('questions not array');

  let exid;
  let query = new Query(utils.config.dbname);
  query.insert(data, 'exam');
  db.handle((result) => {
    exid = new ObjectID(result.ops[0]._id);
    let dqs = [];

    data.questions.forEach((question, idx) => {
      if(utils.hasattr(question, ['content', 'choice', 'answer']))
      {
        let f = {};
        utils.clonewithout(question, f, ['_id']);
        f.exam_id = exid;
        dqs.push(f);
      }
    });

    new Query(utils.config.dbname)
    .insert(dqs, 'question')
    .close();
  });

  return query.close();
}

let jQuestion = function(json) {
  let datas = JSON.parse(json);

  if(datas instanceof Array)
  {
    let p = Promise.resolve(true);
    datas.forEach((data, idx) => {
      p = p.then(function() {
        return qInsert(data);
      });
    });

    p.then(function() {
      console.log('done');
    })
    .catch(function(error) {
      console.log(error);
    });
  }
  else if(typeof datas === 'object')
    qInsert(datas);
}

router.get('/', function(req, res) {
  let options = {
    username: req.session.user.username,
    hash: req.session.hash
  };

  if(req.url.startsWith('/?'))
  {
    let GET = querystring.parse(req.url.substring(2));
    if(typeof GET['type'] !== 'undefined')
    {
      let type = 0;

      ['newsfeed', 'question', 'ebook'].forEach((elem, idx) => {
        if(elem === String(GET['type']).toLowerCase())
          type = idx + 1;
      });

      options.type = type;
    }

    if(typeof GET['mtype'] !== 'undefined')
      options.mtype = GET['mtype'] === 'json' ? 0 : 1;
  }

  res.render('dashboard/restore', options);
});

router.post('/', function(req, res) {
  let POST = req.body;
  if(POST['hash'] !== req.session.hash)
    return res.redirect('/404');

  if(!utils.hasattr(POST, ['type', 'mtype', 'content']))
    return res.redirect('/404');

  POST['mtype'] = Number(POST['mtype']);
  POST['type'] = Number(POST['type']);

  if(POST['mtype'] === 0)
  {
    let json = POST['content'];
    try {
      if(POST['type'] === 1)
      jInsert(json, ['datecreate', 'author', 'title', 'content', 'description'], 'newsfeed');
      else if(POST['type'] === 2)
      jInsert(json, ['datecreate', 'author', 'title', 'content', 'description', 'level', 'subject'], 'ebook');
      else if(POST['type'] === 3)
      jQuestion(json);
      else if(POST['type'] === 0)
      {
        let datas = JSON.parse(json);
        if(datas.hasOwnProperty('newsfeed'))
        jInsert(JSON.stringify(datas['newsfeed']), ['datecreate', 'author', 'title', 'content', 'description'], 'newsfeed');

        if(datas.hasOwnProperty('ebook'))
        jInsert(JSON.stringify(datas['ebook']), ['datecreate', 'author', 'title', 'content', 'description'], 'newsfeed');

        if(datas.hasOwnProperty('exam'))
        jQuestion(JSON.stringify(datas['exam']));
      }
    }
    catch(e)
    {
      console.log('error', e);
    }

    return res.redirect('/dashboard');
  }
  else
    res.end(POST['content']);
});

module.exports = router;
