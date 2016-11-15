const Query = require('mongo-promise');
const utils = require('../utils');
const fs = require('fs');

fs.readFile(__dirname + '/nf_data.json', (err, data) => {
  if (err) throw err;
  let obj = JSON.parse(data);
  let db = new Query('Academy');
  db.remove({}, 'newfeed');
  for(let doc of obj)
    db.insert(doc, 'newfeed');

  db.close();
});
