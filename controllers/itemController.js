const Item = require("../models/item");
const Category = require("../models/category");

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances, authors and genre counts (in parallel)
  const [
    numItems,
    numCategories,
  ] = await Promise.all([
    Item.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Local Library Home",
    items_count: numItems,
    categories_count: numCategories,
  });
});

// Display list of all items.
exports.items = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({})
    .sort({ name: 1 })
    .populate("name")
    .populate("image")
    .populate("price")
    .populate("stock")
    .exec();

  res.render("item_list", { title: "All Items", item_list: allItems });
});

// Display detail page for a specific item.
exports.item_detail = asyncHandler(async (req, res, next) => {
  // Get details of item
  const item = await Item.findById(req.params.id)
    .populate("name")
    .populate("description")
    .populate("category")
    .populate("price")
    .populate("stock")
    .populate("image")
    .exec()

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_detail", {
    title: item.name,
    description: item.description,
    category: item.category,
    price: item.price,
    stock: item.stock,
    image: item.image,
  });
});

// Display Item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
  // Get all categoris, which we can use for adding to our item.
  const allCategories = await Category.find().sort({ name: 1 }).exec();

  res.render("item_form", {
    title: "Create New Item",
    categories: allCategories,
  });
});

// Handle item create on POST.
exports.item_create_post = [
  // Convert the categories to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.categories)) {
      req.body.categories =
        typeof req.body.categories === "undefined" ? [] : [req.body.categories];
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .isDecimal({
          min: 0,
          errorMessage: 'The product stock must be a decimal'
      })
      .escape(),
  body("stock", "Stock must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .isDecimal({
        min: 0,
        errorMessage: 'The product stock must be a decimal'
    })
    .escape(),
  body("item_image", "Image must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category.*").escape(),
  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      stock: req.body.stock,
      price: req.body.price,
      item_image: req.body.item_image,
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      const allCategories = await Category.find().sort({ name: 1 }).exec();

      // Mark our selected genres as checked.
      for (const category of allCategories) {
        if (item.category.indexOf(category._id) > -1) {
            category.checked = "true";
        }
      }
      res.render("item_form", {
        title: "Create Item",
        category: allCategories,
        item: item,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save Item.
      await item.save();
      res.redirect(item.url);
    }
  }),
];

// Display item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id)
    .exec();

  if (item === null) {
    // No results.
    res.redirect("/item");
  }

  res.render("item_delete", {
    title: "Delete Item",
    item: item
  });
});

// Handle item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  // Assume the post has valid id (ie no validation/sanitization).

  const item = await Item.findById(req.params.id)
    .exec();

  if (item === null) {
    // No results.
    res.redirect("/item");
  }

  await item.findByIdAndDelete(req.body.id);
  res.redirect("/item");
});

// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  // Get item, categories for form.
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).exec(),
    Category.find().sort({ name: 1 }).exec(),
  ]);

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  // Mark our selected genres as checked.
  allCategories.forEach((category) => {
    if (item.category.includes(category._id)) category.checked = "true";
  });

  res.render("item_form", {
    title: "Update Item",
    categories: allCategories,
    item: item,
  });
});

// Handle item update on POST.
exports.item_update_post = [
    (req, res, next) => {
      if (!Array.isArray(req.body.categories)) {
        req.body.categories =
          typeof req.body.categories === "undefined" ? [] : [req.body.categories];
      }
      next();
    },
  
    // Validate and sanitize fields.
    body("name", "Name must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("description", "Description must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("stock", "Stock must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .isDecimal({
          min: 0,
          errorMessage: 'The product stock must be a decimal'
      })
      .escape(),
    body("price", "Price must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .isDecimal({
            min: 0,
            errorMessage: 'The product stock must be a decimal'
        })
        .escape(),
    body("item_image", "Image must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("category.*").escape(),
    // Process request after validation and sanitization.
  
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create an item object with escaped and trimmed data.
      const item = new Item({
        name: req.body.name,
        description: req.body.description,
        stock: req.body.stock,
        item_image: req.body.item_image,
        category: req.body.category,
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
  
        // Get all authors and genres for form.
        const allCategories = await Category.find().sort({ name: 1 }).exec();
  
        // Mark our selected genres as checked.
        for (const category of allCategories) {
          if (item.category.indexOf(category._id) > -1) {
              category.checked = "true";
          }
        }
        res.render("item_form", {
          title: "Create Item",
          category: allCategories,
          item: item,
          errors: errors.array(),
        });
      } else {
        // Data from form is valid. Update the record.
        const newItem = await Item.findByIdAndUpdate(req.params.id, item, {});
        res.redirect(newItem.url);
      }
    }),
];
