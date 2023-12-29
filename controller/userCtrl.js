const User = require('../models/userModel.js');
const Product = require ("../models/productModel.js");
const Cart = require ("../models/cartModel.js");
const Coupon = require("../models/couponModel");
const asyncHandler = require('express-async-handler');
const sendEmail = require('../controller/emailCtrl.js');
const generateToken = require ("../config/jwtToken.js");
const mongoose = require('mongoose');
const generateRefreshToken = require ("../config/refreshToken.js");
const validateMongoDbId = require('../utils/validateMongodbId.js');
const crypto = require ("crypto");
const jwt = require('jsonwebtoken');
const uniqid = require("uniqid");

//CREATE

const createUser = asyncHandler(async (req,res) => {
    const email = req.body.email;
    const findUser = await User.findOne({email:email});
    if(!findUser) {
        // Create a new user.
        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
        throw new Error("User already exists");
    }
});

//LOGIN

const loginUserCtrl = asyncHandler(async(req,res) => {
    const { email,password } = req.body;
    // Check if user exists or not.
    const findUser = await User.findOne({ email });
    if(findUser && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateUser = await User.findByIdAndUpdate(
            findUser.id,
            {
            refreshToken: refreshToken,
            },
            {new: true},
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly:true,
            maxAge: 72*60*60*1000,
        });
        res.json({
            _id: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile:findUser?.mobile,
            token:generateToken(findUser?._id),
        });
    } else {
        throw new Error("Invalid credentials");
    }
});

// ADMIN LOGIN

const loginAdmin = asyncHandler(async(req,res) => {
    const { email,password } = req.body;
    // Check if user exists or not.
    const findAdmin = await User.findOne({ email });
    if (findAdmin.role !== 'admin') throw new Error("Not Authorized, you are not an Admin");
    if(findAdmin && await findAdmin.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const updateUser = await User.findByIdAndUpdate(
            findAdmin.id,
            {
            refreshToken: refreshToken,
            },
            {new: true},
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly:true,
            maxAge: 72*60*60*1000,
        });
        res.json({
            _id: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile:findAdmin?.mobile,
            token:generateToken(findAdmin?._id),
        });
    } else {
        throw new Error("Invalid credentials");
    }
});


//GET ALL USERS

const getAllUser = asyncHandler( async (req,res) => {
    try {
        const getUsers = await User.find()
        res.json(getUsers);
    } catch (error) {
        throw new Error(error);
    }
});

// GET A SINGLE USER

const getOneUser = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getOneUser = await User.findById(id);
        res.json ({
            getOneUser,
        });
    } catch (error) {
       throw new Error(error); 
    }
});

//HANDLE REFRESH TOKEN

const handleRefreshToken = asyncHandler(async (req,res) => {
    const cookie = req.cookies;
    console.log(cookie);
    if(!cookie?.refreshToken) throw new Error('No Refresh Token in Cookies');
    const refreshToken = cookie.refreshToken;
    console.log(refreshToken);
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error( ' No refresh token present in the db or not matched');
    jwt.verify(
        refreshToken,process.env.JWT_SECRET,(err,decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error("There is something wrong with refresh token");
        }
        const accessToken = generateToken(user?._id)
        res.json({ accessToken });
    });
});

//LOGOUT FUNCTIONALITY

const logout = asyncHandler(async (req,res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error('No Refresh Token in Cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if(!user) {
        res.clearCookie("refreshToken", {
            httpOnly:true,
            secure:true,
        });
        return res.sendStatus(204); // Forbidden
    }
    await User.findOneAndUpdate(
        { refreshToken: refreshToken },
        {
          refreshToken: '',
        }
      );
    res.clearCookie("refreshToken", {
        httpOnly:true,
        secure:true,
    });
    res.sendStatus(204); // Forbidden
});

// SAVE USER ADDRESS

const saveAddress = asyncHandler (async (req,res,next) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const updateUser = await User.findByIdAndUpdate(_id, {
            address:req?.body?.address,
        },
            {
                new:true
            }
        );
        res.json(updateUser);
    } catch(error) {
        throw new Error(error);
    }
});

//UPDATE USER

const updateUser =  asyncHandler(async (req,res) => {
    const { id } = req.user;
    validateMongoDbId(_id);
    try {
        const updateUser = await User.findByIdAndUpdate(id, {
            firstname:req?.body?.firstname,
            lastname:req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile
        },
            {
            new:true
            }
        );
        res.json(updateUser);
    } catch(error) {
        throw new Error(error);
    }
});

// DELETE USER

const deleteUser = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deleteUser = await User.findByIdAndDelete(id);
        res.json ({
            deleteUser,
        });
    } catch (error) {
       throw new Error(error); 
    }
});

//BLOCK USER

const blockUser = asyncHandler(async (req,res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const blockUser = await User.findByIdAndUpdate(
        id, 
        {
            isBlocked: true,
        },
        {       
            new: true,
        }
      );
      res.json({
        message: "User blocked",
      });
    } catch (error) {
        throw new Error(error);
    }
});

//UNBLOCK USER

const unblockUser = asyncHandler (async (req,res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const unblockUser = await User.findByIdAndUpdate(
        id, 
        {
            isBlocked: false,
        },
        {       
            new: true,
        }
      );
      res.json({
        message: "User unblocked",
      });
    } catch (error) {
        throw new Error(error);
    }
});

//UPDATE PASSWORD

const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body; // Extract the 'password' property from req.body
    validateMongoDbId(_id);
    try {
        const user = await User.findById(_id);
        if (user) {
            if (password) {
                user.password = password;
                const updatedUser = await user.save();
                res.json(updatedUser);
            } else {
                res.status(400).json({ message: 'Password is required' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//FORGOT PASSWORD TOKEN

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found with this email");
    try {
      const token = await user.createPasswordResetToken();
      await user.save();
      const resetURL = `
      Please, follow this link to reset your password. 10 minutes left from now.
      <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</a>
      `;
      const data = {
        to: email,
        text: "Hi User",
        subject: "Forgot Password Link",
        htm: resetURL,
      };
      sendEmail(data, req, res, user);
      res.json(token);
    } catch (error) {
      throw new Error(error);
    }
});

//RESET PASSWORD

const resetPassword = asyncHandler(async (req,res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
        throw new Error("Token expired. Please try again later");
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
});

//GET WISHLIST

const getWishlist = asyncHandler(async (req,res) => {
    const { _id } = req.user;
    try {
        const findUser = await User.findById(_id).populate("wishlist");
        res.json(findUser);
    } catch (error) {
        throw new Error(error);
    }
});

// USER CART

const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    let products = [];
    const user = await User.findById(_id);

    // check if user already has a product in the cart
    const alreadyExistCart = await Cart.findOne({ orderBy: user._id });
    if (alreadyExistCart) {
      alreadyExistCart.remove();
    }

    for (let i = 0; i < cart.length; i++) {
      const product = await Product.findById(cart[i]._id).select("price").exec();

      if (!product) {
        // Handle the case where the product is not found
        throw new Error(`Product with ID ${cart[i]._id} not found.`);
      }

      let object = {
        product: cart[i]._id,
        count: cart[i].count,
        color: cart[i].color,
        price: product.price, // Access the 'price' property safely
      };

      products.push(object);
    }

    let cartTotal = products.reduce((total, product) => {
      return total + product.price * product.count;
    }, 0);

    let newCart = await new Cart({
      products,
      cartTotal,
      orderBy: user?._id,
    }).save();

    res.json(newCart);
  } catch (error) {
    console.error('Error in userCart function:', error);
    throw new Error(error);
  }
});

  //GET USER CART

  const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
      const cart = await Cart.findOne({ orderby: _id }).populate(
        "products.product"
      );
      res.json(cart);
    } catch (error) {
      throw new Error(error);
    }
  });

  //DELETE CART

  const emptyCart = asyncHandler(async (req,res ) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
      const user = await User.findOne({ _id });
      const cart = await Cart.findOneAndDelete({ orderby: user._id });
      res.json(cart);
    } catch (error) {
      throw new Error(error);
    }
  });

  // APPLY COUPON

  const applyCoupon = asyncHandler(async (req, res) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (validCoupon === null) {
      throw new Error("Invalid Coupon");
    }
    const user = await User.findOne({ _id });
    let { cartTotal } = await Cart.findOne({
      orderby: user._id,
    }).populate("products.product");
    let totalAfterDiscount = (
      cartTotal -
      (cartTotal * validCoupon.discount) / 100
    ).toFixed(2);
    await Cart.findOneAndUpdate(
      { orderby: user._id },
      { totalAfterDiscount },
      { new: true }
    );
    res.json(totalAfterDiscount);
  });

  //CREATE ORDER
  
  const createOrder = asyncHandler(async (req, res) => {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
      if (!COD) throw new Error("Create cash order failed");
      const user = await User.findById(_id);
      let userCart = await Cart.findOne({ orderby: user._id });
      let finalAmout = 0;
      if (couponApplied && userCart.totalAfterDiscount) {
        finalAmout = userCart.totalAfterDiscount;
      } else {
        finalAmout = userCart.cartTotal;
      }
  
      let newOrder = await new Order({
        products: userCart.products,
        paymentIntent: {
          id: uniqid(),
          method: "COD",
          amount: finalAmout,
          status: "Cash on Delivery",
          created: Date.now(),
          currency: "usd",
        },
        orderby: user._id,
        orderStatus: "Cash on Delivery",
      }).save();
      let update = userCart.products.map((item) => {
        return {
          updateOne: {
            filter: { _id: item.product._id },
            update: { $inc: { quantity: -item.count, sold: +item.count } },
          },
        };
      });
      const updated = await Product.bulkWrite(update, {});
      res.json({ message: "success" });
    } catch (error) {
      throw new Error(error);
    }
  });

  //MODIFY USER ROLE

  const modifyUserRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    validateMongoDbId(id);
    try {
      const user = await User.findById(id);
      if (user) {
        console.log('User found:', user);
        user.role = role;
        if (!Array.isArray(user.address)) {
          user.address = '';
        }
        const updatedRole = await user.save();
        res.json(updatedRole);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

module.exports = { 
    createUser, 
    loginUserCtrl, 
    getAllUser, 
    getOneUser, 
    deleteUser,
    updateUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword, 
    forgotPasswordToken,
    resetPassword,
    loginAdmin,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    modifyUserRole,
};