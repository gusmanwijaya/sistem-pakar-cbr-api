const mongoose = require("mongoose");

const solusiSchema = mongoose.Schema(
  {
    kode: {
      type: String,
      required: [true, "Kode tidak boleh kosong!"],
    },
    solusi: {
      type: String,
      required: [true, "Solusi tidak boleh kosong!"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Solusi", solusiSchema);
