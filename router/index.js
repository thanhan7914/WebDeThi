const router = require('express').Router();

router.get('/', function(req, res) {
  res.render('index', {title: 'co gi hot', name: 'hello world'});
});

module.exports = router;
