var express = require('express');
var router = express.Router();

/* GET me trae la vista del fomr de logueo */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
