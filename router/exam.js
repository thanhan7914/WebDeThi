const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;
const Query = require('mongo-promise');
const utils = require('../utils');

router.get('/exam/([a-zA-Z0-9_\-]+)\.([a-z0-9]{24})', function(req, res) {
  let id = req.url.substring(req.url.lastIndexOf('.') + 1);
  let options = {};

  let db = new Query(utils.config.dbname)
  .find({_id: new ObjectID(id)}, 'exam')
  .handle((rows) => {
    if(rows.length !== 1) throw new Error('Not Found.');

    options.title = rows[0].title;
    options.datecreate = new Date(rows[0].datecreate).toString();

    if(rows[0].type === 1)
    {
      options.content = '<a class="media" href="' + rows[0].question_file + '">PDF File</a>';
    }
    else {
      options.title = 'Thi Online';
      //render
      options.content = `
      <div class="row">${rows[0].title}</div>
      <div class="rows" style="text-align: center">
        <a href="/contest?id=${rows[0]._id}">Bat dau lam bai</a>
      </div>
      `;
    }
  })
  .close(() => {
    res.render('exam', options);
  }, (error) => {
    res.end(error);
  });
});

module.exports = router;
