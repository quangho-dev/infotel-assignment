const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function auth(req, res, next) {
  if (!req.cookies) {
    console.log("Invalid credentials");
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const accessToken = req.cookies[process.env.ACCESS_TOKEN_COOKIE_NAME];
  if (!accessToken) {
    console.log("Invalid credentials");
    res.status(401);
    throw new Error("Invalid credentials");
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_TOKEN);

    const user = await User.findById(decoded.user.id)
      .select("-__v -password -updatedAt -createdAt")
      .lean();

    if (!user) {
      console.log("Invalid credentials");
      res.status(401);
      throw new Error("Invalid credentials");
    }

    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  auth,
};
