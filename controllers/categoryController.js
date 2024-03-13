const Category = require("../models/category");
const Item = require("../models//item");

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

// Display list of all Category.
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();
  res.render("category_list", {
    title: "Categories",
    category_list: allCategories,
  });
});

// // Display detail page for a specific Category.
exports.category_detail = asyncHandler(async (req, res, next) => {
  // Get details of category and all their items (in parallel)
  const [category, allItemsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);

  if (category === null) {
    // No results.
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_item_list", {
    title: category.name,
    category: category,
    category_items: allItemsByCategory,
  });
});

exports.category_create_get = asyncHandler(async (req, res, next) => {
  res.render("category_form", { 
    title: "Create Category",
    category_name: "", 
    category_description:""});
});

// Handle Category create on POST.
exports.category_create_post = [
  // Validate and sanitize fields.
  body("category_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Category name must be specified.")
    .isAlphanumeric()
    .withMessage("Category name has non-alphanumeric characters."),
  body("category_description")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Category name must be specified."),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Category object with escaped and trimmed data
    const category = new Category({
      name: req.body.category_name,
      description: req.body.category_description
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("category_form", {
        title: "Create Category",
        category_name: category_name,
        category_description: category_description,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save category.
      await category.save();
      // Redirect to new category record.
      res.redirect(category.url);
    }
  }),
];

// Display Category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of category and all their items (in parallel)
  const [category, allItemsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);

  if (category === null) {
    // No results.
    res.redirect("/item");
  }

  console.log(allItemsByCategory.length + " test ");
  res.render("category_delete", {
    title: "Delete Category",
    category: category,
    category_items: allItemsByCategory,
  });
});

// Handle Category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of category and all their items (in parallel)
  const [category, allItemsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "title summary").exec(),
  ]);

  if (allItemsByCategory.length > 0) {
    // Category has items. Render in same way as for GET route.
    res.render("category", {
      title: "Delete Category",
      category: category,
      category_items: allItemsByCategory,
    });
    return;
  } else {
    // Category has no itmes. Delete object and redirect to the list of Categories.
    await Category.findByIdAndDelete(req.body.categoryid);
    res.redirect("/category");
  }
});

// Display Category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec();
  if (category === null) {
    // No results.
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_form", { 
    title: "Update Category",
    category_name: category.name, 
    category_description: category.description
  });
});

// Handle Category update on POST.
exports.category_update_post = [
  // Validate and sanitize fields.
  body("category_name")
  .trim()
  .isLength({ 
    min: 1,
    max: 100
   })
  .escape()
  .withMessage("Category name must be specified.")
  .isAlphanumeric()
  .withMessage("Category name has non-alphanumeric characters."),
  body("category_description")
  .trim()
  .isLength({ 
    min: 1,
    max: 400
   })
  .escape()
  .withMessage("Category name must be specified."),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Category object with escaped and trimmed data
    const category = new Category({
      name: req.body.category_name,
      description: req.body.category_description,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("category_form", {
        title: "Create Category",
        category_name: category_name,
        category_description: category_description,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      await Category.findByIdAndUpdate(req.params.id, category, {});
      // Redirect to new category record.
      res.redirect(category.url);
    }
  }),
];
