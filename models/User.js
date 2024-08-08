const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, "is invalid"],
    index: true,
  },
});


UserSchema.plugin(uniqueValidator);


// @desc generate access token for a user
// @required valid email and password
UserSchema.methods.generateAccessToken = function () {
  const accessToken = jwt.sign(
    {
      "user": {
        "id": this._id,
        "email": this.email
      },
    },
    process.env.JWT_SECRET_TOKEN,
    { expiresIn: "7d" }
  );
  return accessToken;
};


UserSchema.methods.toUserResponse = function () {
  return {
    id: this._id,
    email: this.email,
    accessToken: this.generateAccessToken(),
  };
};


UserSchema.methods.toProfileJSON = function () {
  return {
    id: this._id,
    email: this.username,
  };
};

const User = mongoose.model("UserInfotel", UserSchema);

module.exports = User;
