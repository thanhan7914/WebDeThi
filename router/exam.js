const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;
const Query = require('mongo-promise');
const utils = require('../utils');

router.get('/exam/([a-zA-Z0-9_\-]+)\.([a-z0-9]{24})', function(req, res) {
  let id = req.url.substring(req.url.lastIndexOf('.') + 1);
  try{
    id = new ObjectID(id);
  }catch(e){
    id = new ObjectID();
  }
  let options = {};

  let db = new Query(utils.config.dbname)
  .find({_id: id}, 'exam')
  .handle((rows) => {
    if(rows.length !== 1) throw new Error('Not Found.');

    options.title = rows[0].title;
    options.datecreate = new Date(rows[0].datecreate).toString();

    if(rows[0].type === 1)
    {
      options.hedtit = "ĐỀ THI";
      options.content = '<a class="media" id="m-show" href="' + rows[0].question_file + '">PDF File</a>';
    }
    else {
      //render
      options.hedtit = "XÁC NHẬN LÀM BÀI THI";
      options.content = `
        <button id="contest" data-id="${rows[0]._id}" class="start-doing btn btn-info" type="submit" id="button-start">BẮT ĐẦU LÀM BÀI</button>
      `;
    }
  })
  .close(() => {
    res.render('exam', options);
  }, (error) => {
    res.redirect('/404');
  });
});

module.exports = router;
