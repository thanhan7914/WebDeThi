const Query = require('mongo-promise');
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
  let query = new Query(utils.config.dbname);
  query.insert(data, 'exam');
  query.handle((result) => {
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

let jQuestion = function(datas) {
//  let datas = JSON.parse(json);

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

jQuestion(datas);
