const mongoose = require("mongoose");

const hamaPenyakitSchema = mongoose.Schema(
  {
    kode: {
      type: String,
      required: [true, "Kode tidak boleh kosong!"],
    },
    nama: {
      type: String,
      required: [true, "Nama tidak boleh kosong!"],
    },
    deskripsi: {
      type: String,
    },
    solusi: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Solusi",
      },
    ],
    foto: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HamaPenyakit", hamaPenyakitSchema);
