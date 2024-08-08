const User = require("../models/User");
const { matchPassword, hashPassword } = require("../helpers/password");
const { createRefreshToken, verifyJwtToken } = require("../helpers/jwt");
const asyncHandler = require("express-async-handler");

// @desc Signup
// @route POST auth/signup
// @access Private
const signup = asyncHandler(async (req, res) => {
  const { password, email } = req.body;
  //  check input data
  if (!password || !email) {
    return res.status(400).json({ message: "All Fields are required!" });
  }
  // check duplicate
  const duplicate = await User.findOne({ email }).lean().exec();

  if (duplicate) {
    return res
      .status(409)
      .json({ fieldError: "email", message: "Email already exist" });
  }

  // hash password
  const hashPwd = await hashPassword(password);

  let userObject = { password: hashPwd, email };

  const user = await User.create(userObject);

  const accessToken = user.generateAccessToken();

  // Create secure cookie with access token
  let accessTokenCookieName = process.env.ACCESS_TOKEN_COOKIE_NAME;
  res.cookie(accessTokenCookieName, accessToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  if (user) {
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) throw new Error("Email is required!");
  if (!password) throw new Error("Password is required!");

  const foundUser = await User.findOne({ email }).exec();

  if (!foundUser) {
    return res.status(401).json({
      fieldError: "email",
      message: "Incorrect email. Please try again.",
    });
  }

  const matchPwd = await matchPassword(foundUser.password, password);

  if (!matchPwd) {
    return res.status(401).json({
      fieldError: "password",
      message: "Incorrect password. Please try again!",
    });
  }

  const refreshToken = await createRefreshToken(foundUser);

  // Create secure cookie with refresh token
  let cookieName = process.env.REFRESH_TOKEN_COOKIE_NAME;
  res.cookie(cookieName, refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    path: "/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  const accessToken = foundUser.generateAccessToken();

  // Create secure cookie with access token
  let accessTokenCookieName = process.env.ACCESS_TOKEN_COOKIE_NAME;
  res.cookie(accessTokenCookieName, accessToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  res.status(200).json({
    user: {
      id: foundUser._id,
      email: foundUser.email,
    },
  });
});

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = async (req, res) => {
  const cookies = req.cookies;

  let refreshTokenCookieName = process.env.REFRESH_TOKEN_COOKIE_NAME;

  if (cookies && !cookies[refreshTokenCookieName]) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const refreshToken = cookies[refreshTokenCookieName];
  try {
    const refreshTokenDecoded = await verifyJwtToken(
      refreshToken,
      process.env.JWT_SECRET_REFRESH_TOKEN
    );

    if (!refreshTokenDecoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const foundUser = await User.findOne({
      email: refreshTokenDecoded.user.email,
    }).exec();

    if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

    // Create secure cookie with access token
    let accessTokenCookieName = process.env.ACCESS_TOKEN_COOKIE_NAME;
    res.cookie(accessTokenCookieName, accessToken, {
      httpOnly: true, //accessible only by web server
      secure: true, //https
      sameSite: "None", //cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
    });

    res.status(200).json({
      user: {
        id: foundUser._id,
        email: foundUser.email,
      },
    });
  } catch (error) {
    return res.status(403).json({
      errors: { body: ["Forbidden", error.message] },
    });
  }
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
  const cookies = req.cookies;
  let refreshTokenCookieName = process.env.REFRESH_TOKEN_COOKIE_NAME;
  let accessTokenCookieName = process.env.ACCESS_TOKEN_COOKIE_NAME;

  if (cookies && !cookies[refreshTokenCookieName]) return res.sendStatus(204); //No content
  res.clearCookie(refreshTokenCookieName, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    path: "/auth",
  });

  if (cookies && !cookies[accessTokenCookieName]) return res.sendStatus(204); //No content
  res.clearCookie(accessTokenCookieName, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
  });

  res.json({ message: "Cookie cleared" });
};

module.exports = {
  login,
  signup,
  refresh,
  logout,
};
