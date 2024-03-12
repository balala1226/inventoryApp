var express = require('express');
var router = express.Router();

const item_controller = require('../controllers/itemController');

/* GET home page. */
router.get('/', item_controller.index);

module.exports = router;
