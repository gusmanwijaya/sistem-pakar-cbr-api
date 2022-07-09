const mongoose = require("mongoose");

const gejalaSchema = mongoose.Schema(
  {
    kode: {
      type: String,
      required: [true, "Kode tidak boleh kosong!"],
    },
    nama: {
      type: String,
      required: [true, "Nama tidak boleh kosong!"],
    },
    bobot: {
      type: Number,
      required: [true, "Bobot tidak boleh kosong!"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gejala", gejalaSchema);
