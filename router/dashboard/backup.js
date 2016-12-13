const router = require('express').Router();
const Query = require('mongo-promise');
const ObjectID = require('mongodb').ObjectID;
const querystring = require('querystring');
const utils = require('../../utils');

router.use(function(req, res, next) {
  if(req.session.user.level > 0)
    return res.redirect('/403');
  next();
});

router.get('/', function(req, res) {
  res.render('dashboard/backup', {
    username: req.session.user.username,
    hash: req.session.hash
  });
});

router.post('/', function(req, res) {
  let POST = req.body;
  if(POST['hash'] !== req.session.hash)
    return res.redirect('/404');

  if(!utils.hasattr(POST, ['type', 'mtype']))
    return res.redirect('/404');

  POST['mtype'] = Number(POST['mtype']);
  POST['type'] = Number(POST['type']);
  let options = {
    username: req.session.user.username,
    hash: req.session.hash
  };
  let filter = {};
  if(typeof POST['pid'] !== 'undefined')
    try {
      filter = {_id: new ObjectID(POST['pid'])};
    }catch(e){}

  if(POST['mtype'] === 0)
  {
    if(POST['type'] === 1 || POST['type'] === 2)
    {
      let collection = 'newsfeed';
      if(POST['type'] == 2) collection = 'ebook';

      return new Query(utils.config.dbname)
      .find(filter, collection)
      .handle((rows) => {
        let datas = [];

        rows.forEach((row) => {
          let f = {};
          utils.clonewithout(row, f, ['_id']);
          datas.push(f);
        });

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(datas));
      })
      .close((datas) => {
      });
    }
    else if(POST['type'] === 3)
    {
      let collection = 'exam';

      return new Query(utils.config.dbname)
      .find(filter, collection)
      .handle((rows) => {
        let datas = [];
        let query = new Query(utils.config.dbname);

        rows.forEach((row, idx) => {
          let f = {};
          utils.clonewithout(row, f, ['_id']);

          query.find({exam_id: new ObjectID(row._id)}, 'question')
          .handle((docs) => {
            let dqs = [];

            docs.forEach((doc) => {
              let q = {};
              utils.clonewithout(doc, q, ['_id', 'exam_id']);
              dqs.push(q);
            });

            if(f.type === 0)
              f.questions = dqs;

            datas.push(f);
          });
        });

        query.close(() => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(datas));
        });
      })
      .close();
    }
    else
    {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({message: "try again later...."}));
    }
  }
  else
    res.end(POST['content']);
});

module.exports = router;
