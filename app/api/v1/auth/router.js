const express = require("express");
const { register, login, ubahPassword } = require("./controller");
const router = express.Router();

const { authenticationUsers } = require("../../../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.put("/ubah-password/:id", authenticationUsers, ubahPassword);

module.exports = router;
