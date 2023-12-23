const Brand = require ("../models/brandModel.js");
const asyncHandler = require ("express-async-handler");
const validateMongoDbId = require('../utils/validateMongodbId.js');

//CREATE Brand

const createBrand = asyncHandler(async (req, res) => {
    try {
        const newBrand = await Brand.create(req.body);
        res.json(newBrand);
    } catch (error) {
        throw new Error(error);
    }
});

//UPDATE Brand

const updateBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedBrand = await Brand.findByIdAndUpdate(id,req.body,{
            new: true,
        });
        res.json(updatedBrand);
    } catch (error) {
        throw new Error(error);
    }
});

//DELETE Brand

const deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedBrand = await Brand.findByIdAndDelete(id);
        res.json(deletedBrand);
    } catch (error) {
        throw new Error(error);
    }
});

//GET Brand

const getBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getOneBrand = await Brand.findById(id);
        res.json(getOneBrand);
    } catch (error) {
        throw new Error(error);
    }
});

//GET ALL CATEGORIES

const getAllBrand = asyncHandler(async (req, res) => {
    try {
        const getAllBrands = await Brand.find();
        res.json(getAllBrands);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = { 
    createBrand, 
    updateBrand, 
    deleteBrand, 
    getBrand,
    getAllBrand,
};