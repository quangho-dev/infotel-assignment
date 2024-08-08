require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const dbConnect = require("./configs/dbConnect");
const passport = require('passport')
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const PORT = 5000;
const session = require('express-session')

require("./helpers/passport");

dbConnect();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use("/", express.static(path.join(__dirname, "public")));

app.use(  
  session({
    secret: process.env.GOOGLE_SESSION_SECRET, // session secret
    resave: false,
    saveUninitialized: false,
  })
);

// initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// app routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/booking", require("./routes/bookingRoutes"));
app.use("/payment", require("./routes/paymentRoutes"));

mongoose.connection.once("open", () => {
  app.listen(PORT, () => {
    console.log("Connected to mongoose database");
    console.log(`Server is running on port: ${PORT}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});
