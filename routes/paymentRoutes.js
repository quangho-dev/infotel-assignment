const express = require("express");
const router = express.Router();
const paymentController = require("./../controllers/paymentController");
const { auth } = require("../middlewares/auth");

router.route("/:confirmation_no").post(auth, paymentController.pay);

module.exports = router;