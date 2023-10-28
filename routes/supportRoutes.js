const express = require("express");
const router = express.Router();
const verify = require("../middlewares/authToken");
const checkAdmin = require("../middlewares/checkAdmin");
const { postSupport, getSupport } = require("../controllers/supportController");

router.post("/", verify, postSupport);
router.get("/", checkAdmin, getSupport);

module.exports = router;
