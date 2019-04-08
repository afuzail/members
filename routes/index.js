var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.json(res.session);
  res.render('index', { title: 'Plainsurf' });
});

module.exports = router;
