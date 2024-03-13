var express = require('express');
var router = express.Router();

const category_controller = require('../controllers/categoryController');

/* GET category page. */
router.get('/', category_controller.category_list);

/* GET category form. */
router.get('/category_form', category_controller.category_create_get);

/* POST category form. */
router.post('/category_form', category_controller.category_create_post);

// GET category detail
router.get("/:id", category_controller.category_detail);

// GET category update
router.get("/:id/update", category_controller.category_update_get);

// POST category update
router.post("/:id/update", category_controller.category_update_post);

// GET category delete
router.get("/:id/delete", category_controller.category_delete_get);

// POST category delete
router.post("/:id/delete", category_controller.category_delete_post);

module.exports = router;
