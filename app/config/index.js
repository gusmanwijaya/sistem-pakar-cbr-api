require("dotenv").config();
const path = require("path");

module.exports = {
  rootPath: path.resolve(__dirname, "../../"),
  serviceName: "server-sistem-pakar",
  urlDb: process.env.MONGO_URL,
  jwtKey: process.env.SECRET,
};
