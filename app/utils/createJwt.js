const jwt = require("jsonwebtoken");
const config = require("../config");

const createJwt = (payload) => {
  const token = jwt.sign(payload, config.jwtKey);
  return token;
};

module.exports = createJwt;
