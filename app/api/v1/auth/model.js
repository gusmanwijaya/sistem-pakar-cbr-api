const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, "Nama tidak boleh kosong!"],
    },
    email: {
      type: String,
      required: [true, "Email tidak boleh kosong!"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password tidak boleh kosong!"],
      minLength: 3,
    },
    role: {
      type: String,
      enum: ["pakar", "petani"],
      default: "petani",
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", function () {
  if (!this.isModified("password")) return;
  this.password = bcrypt.hashSync(this.password, 10);
});

module.exports = mongoose.model("User", UserSchema);
