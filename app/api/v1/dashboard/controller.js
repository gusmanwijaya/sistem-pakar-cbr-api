const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");
const HamaPenyakit = require("../hama-penyakit/model");
const Gejala = require("../gejala/model");
const Solusi = require("../solusi/model");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const hamaPenyakit = await HamaPenyakit.countDocuments();
      const gejala = await Gejala.countDocuments();
      const solusi = await Solusi.countDocuments();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data dashboard",
        data: {
          hamaPenyakit,
          gejala,
          solusi,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
