const Query = require('mongo-promise');
const utils = require('../utils');
const fs = require('fs');

let db = new Query('Academy')
.find({}, 'newfeed')
.close((data) => {
  let rows = [];
  data.forEach((doc) => {
    let row = {};
    utils.clonewithout(doc, row, ['_id']);
    rows.push(row);
  });

  fs.writeFile(__dirname + '/nf_data.json', JSON.stringify(rows), (err) => {
    if (err) throw err;
    console.log('It\'s saved!');
  });
});
