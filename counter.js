const router = require('express').Router();
const Query = require('mongo-promise');
const utils = require('./utils');

module.exports = function(req, res) {
  let ip = req.connection.remoteAddress || req.headers['x-forwarded-for'];

  new Query(utils.config.dbname)
  .find({ip}, 'online')
  .join((db, docs) => {
    if(docs.length === 0)
    {
      return new Query(utils.config.dbname)
      .insert({ip, local: req.url, time: Date.now()}, 'online')
      .query({time: utils.time()}, 'counter')
      .exec('count')
      .join((sub, c) => {
        if(c !== 0)
          return sub.update({time: utils.time()}, {$inc: {count: 1}}, 'counter');
        else
          return sub.insert({time: utils.time(), count: 0}, 'counter');
      })
      .remove({time: {$lt: {$date: (new Date(Date.now() - 1000 * 60 * 5)).toString()}}}, 'online')
      .except((error) => {
        console.log(error);
      })
      .close();
    }
    else
      return db.update({ip}, {ip, local: req.url, time: Date.now()}, 'online');
  })
  .close();
};
