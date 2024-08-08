const express = require("express");
const router = express.Router();
const authController = require("./../controllers/authController");
const passport = require("passport");

router.route("/login").post(authController.login);
router.route("/signup").post(authController.signup);
router.route("/refresh").get(authController.refresh);
router.route("/logout").post(authController.logout);
router.route("/google").get(
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);
router.route("/google/callback").get(
  passport.authenticate("google", {
    access_type: "offline",
    scope: ["email", "profile"],
  }),
  (req, res) => {
    if (!req.user) {
      res.status(400).json({ error: "Authentication failed" });
    }
    // return user details
    res.status(200).json(req.user);
  }
);

module.exports = router;
