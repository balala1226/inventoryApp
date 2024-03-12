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

module.exports = router;
