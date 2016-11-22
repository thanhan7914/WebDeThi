const Query = require('mongo-promise');
const utils = require('../utils');
const fs = require('fs');

let collection = 'exam';
let file = '/exam_data.json';

fs.readFile(__dirname + file, (err, data) => {
  if (err) throw err;
  let obj = JSON.parse(data);
  let db = new Query(utils.config.dbname);
  db.remove({}, collection);
  for(let doc of obj)
    db.insert(doc, collection);

  db.close();
});
