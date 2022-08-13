const mongoose = require("mongoose");

const identifikasiSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: String,
  },
  selectedGejala: {
    type: Array,
    default: [],
  },
  allPenyakitnGejala: {
    type: Array,
    default: [],
  },
  processData: {
    type: Array,
    default: [],
  },
  detailPenyakit: {
    type: Object,
    default: {},
  },
});

module.exports = mongoose.model("Identifikasi", identifikasiSchema);
