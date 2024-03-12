var express = require('express');
var router = express.Router();

const item_controller = require('../controllers/itemController');

/* GET item page. */
router.get('/', item_controller.items);

/* GET item form. */
router.get('/item_form', item_controller.item_create_get);

/* POST item form. */
router.post('/item_form', item_controller.item_create_post);

// GET item detail
router.get("/:id", item_controller.item_detail);

module.exports = router;
