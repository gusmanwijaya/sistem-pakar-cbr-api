const mongoose = require("mongoose");
const { urlDb } = require("../config");

mongoose.connect(urlDb);

const database = mongoose.connection;

module.exports = database;
