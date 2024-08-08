const express = require("express");
const router = express.Router();
const bookingController = require("./../controllers/bookingController");
const { auth } = require("../middlewares/auth");

router.route("/:confirmation_no").get(auth, bookingController.processXMLfile);

module.exports = router;