const User = require("./model");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");
const bcrypt = require("bcryptjs");
const createPayloadJwt = require("../../../utils/createPayloadJwt");
const createJwt = require("../../../utils/createJwt");

module.exports = {
  register: async (req, res, next) => {
    try {
      const { nama, email, password, role } = req.body;

      if (!nama) throw new CustomError.BadRequest("Nama tidak boleh kosong!");
      if (!email) throw new CustomError.BadRequest("Email tidak boleh kosong!");
      if (!password)
        throw new CustomError.BadRequest("Password tidak boleh kosong!");
      if (password.length < 3)
        throw new CustomError.BadRequest(
          "Password tidak boleh kurang dari 3 karakter!"
        );

      const checkEmail = await User.findOne({ email }).select("email");
      if (checkEmail) throw new CustomError.BadRequest(`Email sudah terdaftar`);

      const data = new User({ nama, email, password, role });
      await data.save();
      delete data._doc.password;

      res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        message: "Register user berhasil!",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password)
        throw new CustomError.BadRequest(
          "Email atau password tidak boleh kosong!"
        );

      const data = await User.findOne({ email });
      if (!data) throw new CustomError.Unauthorized("User tidak ditemukan!");

      const isMatch = await bcrypt.compare(password, data?.password);
      if (!isMatch) throw new CustomError.Unauthorized("Password salah!");

      const payload = createPayloadJwt(data);
      const token = createJwt(payload);

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Login user berhasil!",
        data: {
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  ubahPassword: async (req, res, next) => {
    try {
      const { id: penggunaId } = req.params;
      const { oldPassword, newPassword, confirmNewPassword } = req.body;

      if (!oldPassword || !newPassword || !confirmNewPassword)
        throw new CustomError.BadRequest("Semua field tidak boleh kosong!");

      let data = await User.findOne({ _id: penggunaId }).select(
        "_id email password"
      );
      if (!data) throw new CustomError.Unauthorized("User tidak ditemukan!");

      const isMatch = await bcrypt.compare(oldPassword, data?.password);
      if (!isMatch) throw new CustomError.Unauthorized("Password lama salah!");

      if (oldPassword === newPassword)
        throw new CustomError.BadRequest(
          "Password baru sama dengan (=) password lama!"
        );

      if (newPassword !== confirmNewPassword)
        throw new CustomError.BadRequest(
          "Password baru tidak sama dengan (!=) konfirmasi password!"
        );

      data.password = newPassword;
      await data.save();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Ubah password berhasil!",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
