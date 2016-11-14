const router = require('express').Router();
const Query = require('mongo-promise');
const utils = require('../../utils');

router.get('/', function(req, res, next) {
  if(req.url === '/?newposts')
    return next();

  let options = {};
  options.username = req.session.user.username;

  let count;

  let db = new Query(utils.config.dbname);
  db.query({}, 'newfeed')
  .exec('count')
  .handle((c) => {
    count = c;
  })
  .query({}, 'newfeed')
  .exec('limit', utils.config.dashboard.newfeed.limit)
  .exec('toArray')
  .handle((docs) => {
    //query
  })
  .except((error) => {
    //error
  })
  .close()
  .handle((done) => {
    res.render('dashboard/newfeed', options);
  });
});

router.use(function(req, res) {
  res.render('dashboard/newposts');
});

module.exports = router;
