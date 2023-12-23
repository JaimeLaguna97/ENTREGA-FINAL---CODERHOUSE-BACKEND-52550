const Category = require ("../models/prodCategoryModel.js");
const asyncHandler = require ("express-async-handler");
const validateMongoDbId = require('../utils/validateMongodbId.js');

//CREATE CATEGORY

const createCategory = asyncHandler(async (req, res) => {
    try {
        const newCategory = await Category.create(req.body);
        res.json(newCategory);
    } catch (error) {
        throw new Error(error);
    }
});

//UPDATE CATEGORY

const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id,req.body,{
            new: true,
        });
        res.json(updatedCategory);
    } catch (error) {
        throw new Error(error);
    }
});

//DELETE CATEGORY

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        res.json(deletedCategory);
    } catch (error) {
        throw new Error(error);
    }
});

//GET CATEGORY

const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getOneCategory = await Category.findById(id);
        res.json(getOneCategory);
    } catch (error) {
        throw new Error(error);
    }
});

//GET ALL CATEGORIES

const getAllCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getAllCategories = await Category.find();
        res.json(getAllCategories);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = { 
createCategory, 
updateCategory, 
deleteCategory, 
getCategory,
getAllCategory,
};
