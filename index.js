const bodyParser = require("body-parser");
const express = require("express");
const dbConnect = require("./config/dbConnect");
const app = express();
const dotenv = require("dotenv").config();
const authRouter = require("./routes/authRoute.js");
const productRouter = require("./routes/productRoute.js");
const categoryRouter = require("./routes/prodCategoryRoute.js");
const brandRouter = require("./routes/brandRoute.js");
const couponRouter = require("./routes/couponRoute.js");
const { notFound, errorHandler } = require("./middlewares/errorHandler.js");
const cookieParser = require("cookie-parser");
const morgan = require('morgan');

const PORT = process.env.PORT || 4000;
dbConnect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(morgan('dev'));

//ROUTES
app.use('/api/user', authRouter);
app.use('/api/product', productRouter);
app.use('/api/category', categoryRouter);
app.use('/api/brand', brandRouter);
app.use('/api/coupon', couponRouter)
app.use('/api/user-role', authRouter);

//MIDDLEWARES
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is runing at PORT ${PORT}`);
});