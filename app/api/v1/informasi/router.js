const express = require("express");
const router = express.Router();

const { get, getOne } = require("./controller");
const { authenticationUsers } = require("../../../middleware/auth");

router.use(authenticationUsers);

router.get("/get", get);
router.get("/get-one/:id", getOne);

module.exports = router;
