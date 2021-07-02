var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  console.log(req.session.id)
  res.render('main');
});

module.exports = router;
