const Query = require('mongo-promise');
const utils = require('../utils');
const fs = require('fs');

let collection = 'exam';
let file = '/exam_data.json';

let db = new Query(utils.config.dbname)
.find({}, collection)
.close((data) => {
  let rows = [];
  data.forEach((doc) => {
    let row = {};
//    utils.clonewithout(doc, row, ['_id']);
    rows.push(doc);
  });

  fs.writeFile(__dirname + file, JSON.stringify(rows), (err) => {
    if (err) throw err;
    console.log('It\'s saved!');
  });
});
