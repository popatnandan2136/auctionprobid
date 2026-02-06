import Category from "../models/Category.js";

export const addCategory = async (req, res) => {
  const category = new Category({
    name: req.body.name,
  });

  await category.save();
  res.send("Category added");
};

export const getCategories = async (req, res) => {
  const categories = await Category.find();
  res.send(categories);
};

export const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.send("Category deleted");
};
