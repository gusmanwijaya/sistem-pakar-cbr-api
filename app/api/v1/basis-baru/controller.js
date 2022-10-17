const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");
const Identifikasi = require("../identifikasi/model");
const BasisPengetahuan = require("../basis-pengetahuan/model");
const HamaPenyakit = require("../hama-penyakit/model");
const Gejala = require("../gejala/model");
const Solusi = require("../solusi/model");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const data = await Identifikasi.find({ isVerified: false })
        .select(
          "_id user date selectedGejala detailPenyakit detailSolusi isVerified"
        )
        .populate({
          path: "user",
          select: "_id nama email role",
          model: "User",
        })
        .limit(limit)
        .skip(limit * (page - 1));

      const count = await Identifikasi.countDocuments({ isVerified: false });

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data basis baru",
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
      const { id: identifikasiId } = req.params;

      const data = await Identifikasi.findOne({
        _id: identifikasiId,
      })
        .select(
          "_id user date selectedGejala detailPenyakit detailSolusi isVerified"
        )
        .populate({
          path: "user",
          select: "_id nama email role",
          model: "User",
        });

      if (!data)
        throw new CustomError.NotFound(
          `Basis baru dengan id : ${identifikasiId} tidak ditemukan!`
        );

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan detail data basis baru",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  revisi: async (req, res, next) => {
    try {
      const { id: identifikasiId } = req.params;
      const { solusi, gejala } = req.body;

      let data = await Identifikasi.findOne({
        _id: identifikasiId,
      })
        .select(
          "_id user date selectedGejala detailPenyakit detailSolusi isVerified"
        )
        .populate({
          path: "user",
          select: "_id nama email role",
          model: "User",
        });

      if (!data)
        throw new CustomError.NotFound(
          `Basis baru dengan id : ${identifikasiId} tidak ditemukan!`
        );

      const selectedGejala = await Gejala.find({
        _id: { $in: JSON.parse(gejala) },
      }).select("_id kode nama bobot");
      const detailSolusi = await Solusi.find({
        _id: { $in: JSON.parse(solusi) },
      }).select("_id kode solusi");

      data.selectedGejala = selectedGejala;
      data.detailSolusi = detailSolusi;
      await data.save();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil melakukan revisi data basis baru",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  confirmVerified: async (req, res, next) => {
    try {
      const { id: identifikasiId } = req.params;

      let data = await Identifikasi.findOne({ _id: identifikasiId })
        .select(
          "_id user date selectedGejala allPenyakitnGejala processData detailPenyakit detailSolusi isVerified"
        )
        .populate({
          path: "user",
          select: "_id nama email role",
          model: "User",
        });

      if (!data)
        throw new CustomError.NotFound(
          `Basis baru dengan id : ${identifikasiId} tidak ditemukan!`
        );

      data.isVerified = true;
      await data.save();

      let basisPengetahuan = await BasisPengetahuan.findOne({
        hamaPenyakit: data?.detailPenyakit[0]?._id,
      });

      basisPengetahuan.hamaPenyakit = data?.detailPenyakit[0]?._id;
      basisPengetahuan.gejala = data?.selectedGejala;
      basisPengetahuan.solusi = data?.detailSolusi;
      await basisPengetahuan.save();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message:
          "Berhasil melakukan verifikasi basis baru, basis baru sudah dipindahkan ke basis pengetahuan!",
        data: {
          basisPengetahuan,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  destroy: async (req, res, next) => {
    try {
      const { id: identifikasiId } = req.params;

      let data = await Identifikasi.findOne({ _id: identifikasiId });

      if (!data)
        throw new CustomError.NotFound(
          `Basis baru dengan id : ${identifikasiId} tidak ditemukan!`
        );

      await data.remove();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil menghapus data basis baru!",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
