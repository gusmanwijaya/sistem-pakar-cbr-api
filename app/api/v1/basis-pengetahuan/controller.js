const BasisPengetahuan = require("./model");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const data = await BasisPengetahuan.find()
        .select("_id hamaPenyakit gejala solusi")
        .limit(limit)
        .skip(limit * (page - 1))
        .populate({
          path: "hamaPenyakit",
          select: "_id kode nama deskripsi foto",
          model: "HamaPenyakit",
        })
        .populate({
          path: "gejala",
          select: "_id kode nama bobot",
          model: "Gejala",
        })
        .populate({
          path: "solusi",
          select: "_id solusi",
          model: "Solusi",
        });

      const count = await BasisPengetahuan.countDocuments();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data basis pengetahuan",
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
      const { id: basisPengetahuanId } = req.params;

      const data = await BasisPengetahuan.findOne({ _id: basisPengetahuanId })
        .select("_id hamaPenyakit gejala solusi")
        .populate({
          path: "hamaPenyakit",
          select: "_id kode nama deskripsi foto",
          model: "HamaPenyakit",
        })
        .populate({
          path: "gejala",
          select: "_id kode nama bobot",
          model: "Gejala",
        })
        .populate({
          path: "solusi",
          select: "_id solusi",
          model: "Solusi",
        });

      if (!data)
        throw new CustomError.NotFound(
          `Basis pengetahuan dengan id ${basisPengetahuanId} tidak ditemukan`
        );

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data basis pengetahuan",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { hamaPenyakit, gejala, solusi } = req.body;

      const data = new BasisPengetahuan({
        hamaPenyakit,
        gejala: JSON.parse(gejala),
        solusi: JSON.parse(solusi),
      });
      await data.save();

      res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        message: "Data basis pengetahuan berhasil ditambahkan",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id: basisPengetahuanId } = req.params;
      const { hamaPenyakit, gejala, solusi } = req.body;

      let data = await BasisPengetahuan.findOne({ _id: basisPengetahuanId });

      if (!data)
        throw new CustomError.NotFound(
          `Basis pengetahuan dengan id ${basisPengetahuanId} tidak ditemukan`
        );

      data.hamaPenyakit = hamaPenyakit;
      data.gejala = JSON.parse(gejala);
      data.solusi = JSON.parse(solusi);
      await data.save();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data basis pengetahuan berhasil diubah",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  destroy: async (req, res, next) => {
    try {
      const { id: basisPengetahuanId } = req.params;

      let data = await BasisPengetahuan.findOne({ _id: basisPengetahuanId });

      if (!data)
        throw new CustomError.NotFound(
          `Basis pengetahuan dengan id ${basisPengetahuanId} tidak ditemukan`
        );

      await data.remove();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data basis pengetahuan berhasil dihapus",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
