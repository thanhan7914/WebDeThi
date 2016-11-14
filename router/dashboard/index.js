const router = require('express').Router();

router.get('/', function(req, res) {
  res.render('dashboard/index.eng');
});

module.exports = router;
