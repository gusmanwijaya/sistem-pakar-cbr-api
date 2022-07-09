const User = require("../auth/model");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const data = await User.find({ role: "petani" })
        .select("_id nama email role")
        .limit(limit)
        .skip(limit * (page - 1));

      const count = await User.countDocuments({ role: "petani" });

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data pengguna",
        current_page: parseInt(page),
        total_page: Math.ceil(count / limit),
        total_data: count,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  getOne: async (req, res, next) => {
    try {
      const { id: penggunaId } = req.params;

      const data = await User.findOne({ _id: penggunaId }).select(
        "_id nama email role"
      );

      if (!data)
        throw new CustomError.NotFound(
          `Pengguna dengan id ${penggunaId} tidak ditemukan`
        );

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data pengguna",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { nama, email, password, role } = req.body;

      const checkEmail = await User.findOne({ email }).select("email");
      if (checkEmail) throw new CustomError.BadRequest(`Email sudah terdaftar`);

      const data = new User({ nama, email, password, role });
      await data.save();

      res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        message: "Data pengguna berhasil ditambahkan",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id: penggunaId } = req.params;
      const { nama, email, role = "petani" } = req.body;

      const checkEmail = await User.findOne({
        _id: {
          $ne: penggunaId,
        },
        email,
      }).select("email");
      if (checkEmail) throw new CustomError.BadRequest(`Email sudah terdaftar`);

      let data = await User.findOne({ _id: penggunaId });

      if (!data)
        throw new CustomError.NotFound(
          `Pengguna dengan id ${penggunaId} tidak ditemukan`
        );

      data.nama = nama;
      data.email = email;
      data.role = role;
      await data.save();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data pengguna berhasil diubah",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  destroy: async (req, res, next) => {
    try {
      const { id: penggunaId } = req.params;

      let data = await User.findOne({ _id: penggunaId });

      if (!data)
        throw new CustomError.NotFound(
          `Pengguna dengan id ${penggunaId} tidak ditemukan`
        );

      await data.remove();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data pengguna berhasil dihapus",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
