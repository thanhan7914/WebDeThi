const router = require('express').Router();
const Query = require('mongo-promise');
const utils = require('./utils');

module.exports = function(req, res) {
  let local = req.url;
  let ip = req.connection.remoteAddress || req.headers['x-forwarded-for'];

  new Query(utils.config.dbname)
  .remove({time: {$lt: Date.now() - 1000 * 60 * utils.config.tconline}}, 'online')
  .find({ip}, 'online')
  .join((db, docs) => {
    let query = new Query(utils.config.dbname);
    let username = typeof req.session.user.username !== 'undefined'? req.session.user.username : 'Guest';

    if(docs.length === 0)
      return query.insert({ip, username, local, time: Date.now()}, 'online')
      .query({time: utils.time()}, 'counter')
      .exec('count')
      .join((sub, c) => {
        if(c !== 0)
          return sub.update({time: utils.time()}, {$inc: {count: 1}}, 'counter');
        else
          return sub.insert({time: utils.time(), count: 0}, 'counter');
      })
      .except((error) => {
        console.log(error);
      })
      .close();
    else
      return query.update({ip}, {ip, username, local, time: Date.now()}, 'online')
      .close();
  })
  .close();
};
