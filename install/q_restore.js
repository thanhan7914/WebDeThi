const Query = require('mongo-promise');
const ObjectID = require('mongodb').ObjectID;
const utils = require('../utils');
const fs = require('fs');
const datas = require('./q_data.json');

let collection = 'exam';

let qInsert = function(data) {
  if(typeof data !== 'object') throw Error('not object');
  if(data.type === 1)
    return jInsert(JSON.stringify(data), ['title', 'subject', 'level', 'year', 'type', 'datecreate', 'question_file'], 'exam');
  if(!utils.hasattr(data, ['title', 'subject', 'level', 'year', 'type', 'datecreate', 'count', 'questions'])) throw Error('not attr');

  if(!(data.questions instanceof Array)) throw Error('questions not array');

  let exid;
  let g = {};
  utils.clonewithout(data, g, ['questions']);
  return new Query(utils.config.dbname)
  .insert(g, 'exam')
  .handle((result) => {
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
    .handle(console.log)
    .close();
  })
  .close();
}

let jQuestion = function(datas) {

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

new Query(utils.config.dbname)
.remove({}, 'exam')
.remove({}, 'question')
.handle(() => {
  jQuestion(datas);
})
.except(console.log)
.close();
