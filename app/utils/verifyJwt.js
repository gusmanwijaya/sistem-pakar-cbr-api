const jwt = require("jsonwebtoken");
const config = require("../config");

const verifyJwt = (token) => jwt.verify(token, config.jwtKey);

module.exports = verifyJwt;
