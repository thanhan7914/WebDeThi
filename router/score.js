const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;
const Query = require('mongo-promise');
const utils = require('../utils');

let check = function(answers, q_id, ans) {
  let len = answers.length;

  for(let i = 0; i < len; i++)
    if(String(answers[i].id) === String(q_id))
      if(Number(answers[i].answer) !== NaN
         && Number(answers[i].answer) === Number(ans))
        return true;
      else return false;

  return false;
}

router.get('/', function(req, res) {
  res.redirect('/');
});

router.post('/', function(req, res) {
  let POST = req.body;
  if(!utils.hasattr(POST, ['exam_id', 'answers']))
    return res.redirect('/');

  let options = {ex_tit: 'De thi'};
  let id;
  let answers;
  try {
    answers = JSON.parse(POST['answers']);
    id = new ObjectID(POST['exam_id']);
  }catch(e){}

  let chk = [];
  let db = new Query(utils.config.dbname)
  .find({exam_id: id}, 'question')
  .handle((docs) => {
    let len = docs.length;
    for(let i = 0; i < len; i++)
      chk.push(check(answers, docs[i]._id, docs[i].answer));

    let chtr = chk.filter(i => i).length;
    options.score = ((chtr / len) * 10).toFixed(2);
    options.nright = chtr;
    options.count = len;
  })
  .close(() => {
    let hscore = utils.createHash(req.session.hex + '_' + options.nright + '_' + POST['exam_id']);
    options.exam_id = POST['exam_id'];
    req.session.hscore = hscore;
    res.render('score', options);
  }, (error) => {
    console.log(error);
    res.render('score', {error});
  });
});

module.exports = router;
