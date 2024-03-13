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

// GET item update
router.get("/:id/update", item_controller.item_update_get);

// POST item update
router.post("/:id/update", item_controller.item_update_post);

// GET item delete
router.get("/:id/delete", item_controller.item_delete_get);

// POST item delete
router.post("/:id/delete", item_controller.item_delete_post);

module.exports = router;
