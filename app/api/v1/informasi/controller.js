const HamaPenyakit = require("../hama-penyakit/model");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");

module.exports = {
  get: async (req, res, next) => {
    try {
      const { keyword, page = 1, limit = 10 } = req.query;

      let condition = {};

      if (keyword) {
        condition = {
          nama: {
            $regex: keyword,
            $options: "i",
          },
        };
      }

      const data = await HamaPenyakit.find(condition)
        .select("_id kode nama foto solusi deskripsi")
        .populate({
          path: "solusi",
          select: "_id kode solusi",
          model: "Solusi",
        })
        .limit(limit)
        .skip(limit * (page - 1));

      const count = await HamaPenyakit.countDocuments(condition);

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data informasi hama & penyakit",
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
      const { id: hamaPenyakitId } = req.params;

      const data = await HamaPenyakit.findOne({ _id: hamaPenyakitId })
        .select("_id kode nama foto solusi deskripsi")
        .populate({
          path: "solusi",
          select: "_id kode solusi",
          model: "Solusi",
        });

      if (!data)
        throw new CustomError.NotFound(
          `Hama & penyakit dengan id ${hamaPenyakitId} tidak ditemukan`
        );

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data detail informasi hama & penyakit",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
