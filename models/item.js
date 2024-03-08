const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: Schema.ObjectId, ref: "Category", required: true },  
  price: { type: Schema.Types.Decimal128, required: true },
  stock: {type: Number, required: true},
  image: {type: String, required:true}
});

// Virtual for this book instance URL.
ItemSchema.virtual("url").get(function () {
  return "/item/" + this._id;
});

// Export model.
module.exports = mongoose.model("Item", ItemSchema);
