const Product = require("../models/productModel.js");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const cloudinaryUploadImg = require('../utils/cloudinary.js');
const validateMongoDbId = require('../utils/validateMongodbId.js');
const fs = require ("fs");

//CREATE PRODUCT

const createProduct = asyncHandler(async (req,res) => {
    try {
        if(req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);
     res.json(newProduct);
    } catch (error) {
        throw new Error(error);
    }
});

//UPDATE PRODUCTS

const updateProduct = asyncHandler(async (req,res) => {
    const id = req.params.id;
    try {
        if (req.body.title) {
            req.body.slug = slugify (req.body.title);
        }
    const updateProduct = await Product.findOneAndUpdate( { _id:id }, req.body, {
        new: true,
    });
    res.json(updateProduct);
    } catch (error) {
        throw new Error(error);
    }
});

// DELETE PRODUCT

const deleteProduct = asyncHandler(async (req,res) => {
    const id = req.params.id;
    try {
        if (req.body.title) {
            req.body.slug = slugify (req.body.title);
        }
    const deleteProduct = await Product.findOneAndDelete({ _id:id });
    res.json(deleteProduct);
    } catch (error) {
        throw new Error(error);
    }
});


//GET PRODUCT

const getProduct = asyncHandler (async (req,res) => {
    const { id } = req.params;
    try {
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    } catch (error) {
        throw new Error(error);
    }
});

// GET ALL PRODUCTS

const getAllProducts = asyncHandler (async (req, res) => {
    try {
        //Filtering
        const queryObj = { ...req.query }
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((el) => delete queryObj[el]); 
        console.log(queryObj);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        
        let query = Product.find (JSON.parse(queryStr));

        //Sorting

        if(req.query.sort) {
            const sortBy = req.query.sort.split(',').join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt")
        }

        //Limiting the fields

        if(req.query.fields) {
            const fields = req.query.fields.split(',').join(" ");
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        // Pagination

        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page -1) * limit;
        query = query.skip(skip).limit(limit);
        if(req.query.page) {
            const productCount = await Product.countDocuments();
            if (skip >= productCount) throw new Error("This page does not exists");
        }
        console.log(page, limit, skip);


        const product = await query;
        res.json(product);
    } catch (error) {
        throw new Error(error);
    }
});

// ADD TO WISH LIST

const addToWishList = asyncHandler(async (req, res) => {
    const {_id} = req.user;
    const { prodId } = req.body;
    try {
        const user = await User.findById(_id);
        const alreadyAdded = user.wishlist.find((id) => id.toString () === prodId);
        if( alreadyAdded) {
            let user = await User.findByIdAndUpdate(_id, {
                $pull: {wishlist: prodId}
            }, {
              new: true,  
            }
            );
            res.json(user);
        } else {
            let user = await User.findByIdAndUpdate(_id, {
                $push: {wishlist: prodId}
            }, {
              new: true,  
            }
            );
            res.json(user);
        }
    } catch(error) {
        throw new Error(error);
    }
});

// RATING

const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, prodId, comment } = req.body;
    try {
        const product = await Product.findById(prodId);
        const alreadyRated = product.ratings.find(
            (rating) => rating.postedBy.toString() === _id.toString()
        );
        if (alreadyRated) {
            await Product.updateOne(
                {
                    _id: prodId,
                    'ratings.postedBy': _id,
                },
                {
                    $set: { 'ratings.$.star': star, 'ratings.$.comment': comment },
                }
            );
        } else {
            await Product.findByIdAndUpdate(
                prodId,
                {
                    $push: {
                        ratings: {
                            star: star,
                            comment: comment,
                            postedBy: _id,
                        },
                    },
                }
            );
        }
        const updatedProduct = await Product.findById(prodId);
        const totalRating = updatedProduct.ratings.length;
        const ratingSum = updatedProduct.ratings
            .map((item) => item.star)
            .reduce((prev, curr) => prev + curr, 0);
        const actualRating = Math.round(ratingSum / totalRating);
        
        const finalProduct = await Product.findByIdAndUpdate(
            prodId,
            {
                totalRating: actualRating,
            },
            { new: true }
        );
        res.json(finalProduct); 
    } catch (error) {
        console.error('Error in rating function:', error);
        throw new Error(error);
    }
});

const uploadImages = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const uploader = (path) => cloudinaryUploadImg(path, "images");
        const urls = [];
        const files = req.files;
        for (const file of files) {
            const { path } = file;
            const newpath = await uploader(path);
            urls.push(newpath);
        }
        const findProduct = await Product.findByIdAndUpdate(
            id, 
            {
                images: urls.map((file) => {
                    return file;
            }),
        }, 
        {
            new: true
        }
    );
    res.json(findProduct);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = { 
    createProduct, 
    getProduct, 
    getAllProducts, 
    updateProduct, 
    deleteProduct,
    addToWishList,
    rating,
    uploadImages,
};