#! /usr/bin/env node

console.log(
    'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Item = require("./models/item");
  const Category = require("./models/category");

  const categories = [];
  const items = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createCategories();
    await createItems();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  // We pass the index to the ...Create functions so that, for example,
  // genre[0] will always be the Fantasy genre, regardless of the order
  // in which the elements of promise.all's argument complete.
  async function categoryCreate(index, name, description) {
    const category = new Category({ name: name, description: description });
    await category.save();
    categories[index] = category;
    console.log(`Added category: ${name}`);
  }
  
  async function itemCreate(index, name, description, category, price, stock, imageUrl) {
    const itemDetails = {
        name: name,
        description: description,
        category: category,
        price: price,
        stock: stock,
        imageUrl: imageUrl
    };
  
    const item = new Item(itemDetails);
    await item.save();
    items[index] = item;
    console.log(`Added Item: ${name}`);
  }

  async function createCategories() {
    console.log("Adding catagories");
    await Promise.all([
      categoryCreate(0, "Jewelry", "Fashion Accessories"),
      categoryCreate(1, "Footwear", "Protect your feet"),
      categoryCreate(2, "Men's Clothing", "Clothing made for men"),
      categoryCreate(3, "Women's Clothing", "Clothing made for women"),
    ]);
  }

  async function createItems() {
    console.log("Adding Books");
    await Promise.all([
      itemCreate(0,
        "Black Shirt",
        "A black shirt",
        categories[2],
        1.11,
        500,
        "/images/blackShirt.webp"
      ),
      itemCreate(1,
        "Polo Shirt",
        "A casual polo shirt",
        categories[2],
        1.11,
        500,
        "/images/poloShirt.jpg"
      ),
      itemCreate(2,
        "Gold Necklace",
        "A gold necklace",
        categories[0],
        100.89,
        500,
        "/images/goldNecklace.jpg"
      ),
      itemCreate(3,
        "Sandals",
        "A Sandal",
        categories[1],
        3,
        10,
        "/images/sandals.webp"
      ),
      itemCreate(4,
        "Tennis shoes",
        "Shoes made for tennis",
        categories[1],
        5.99,
        50,
        "/images/shoes.jpg"
      ),
      itemCreate(5,
        "Casual Dress",
        "Your new sunday dress",
        categories[3],
        3.99,
        320,
        "/images/casualDress.jpg"
      ),
      itemCreate(6,
        "White Dress",
        "A white shirt",
        categories[3],
        2.99,
        500,
        "/images/whiteDress.webp"
      ),
    ]);
  }