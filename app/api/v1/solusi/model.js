const mongoose = require("mongoose");

const solusiSchema = mongoose.Schema(
  {
    solusi: {
      type: String,
      required: [true, "Solusi tidak boleh kosong!"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Solusi", solusiSchema);
