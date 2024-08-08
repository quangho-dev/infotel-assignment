const jwt = require('jsonwebtoken');

const createRefreshToken = async (user) => {
  return new Promise((resolve, reject) => {
    jwt.sign({
      "user": {
        "id": user._id,
        "email": user.email
      },
    },
      process.env.JWT_SECRET_REFRESH_TOKEN,
      { expiresIn: "7d" }, (err, token) => {
        if (err) return reject(err);
        return resolve(token)
      })
  })
}


const verifyJwtToken = async (token, secretKey) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      return resolve(decoded);
    });
  });
};

module.exports = { createRefreshToken, verifyJwtToken }