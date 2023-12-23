const express = require('express');
const { 
    createProduct, 
    getProduct, 
    getAllProducts, 
    updateProduct, 
    deleteProduct, 
    addToWishList, 
    rating, 
    uploadImages,
} = require('../controller/productCtrl');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware.js');
const { uploadPhoto, productImgResize } = require('../utils/uploadImages.js');

router.post("/", authMiddleware, isAdmin, createProduct);
router.put(
    "/upload/:id", 
    authMiddleware, 
    isAdmin, 
    uploadPhoto.array("images",10),
    productImgResize,
    uploadImages,
);
router.get("/:id", getProduct);
router.put('/wishlist', authMiddleware, addToWishList);
router.put('/rating', authMiddleware, rating);

router.put("/:id", authMiddleware, isAdmin, updateProduct,);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.get("/", getAllProducts);

module.exports = router;