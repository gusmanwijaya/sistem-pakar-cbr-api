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
        message: "Berhasil mendapatkan data kasus baru",
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
        message: "Berhasil mendapatkan detail data kasus baru",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  revisi: async (req, res, next) => {
    try {
      const { id: identifikasiId } = req.params;
      const { hamaPenyakit, solusi, gejala } = req.body;

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

      const detailPenyakit = await HamaPenyakit.find({
        _id: { $in: JSON.parse(hamaPenyakit) },
      }).select("_id kode nama deskripsi foto");
      const selectedGejala = await Gejala.find({
        _id: { $in: JSON.parse(gejala) },
      }).select("_id kode nama bobot");
      const detailSolusi = await Solusi.find({
        _id: { $in: JSON.parse(solusi) },
      }).select("_id kode solusi");

      data.detailPenyakit = detailPenyakit;
      data.selectedGejala = selectedGejala;
      data.detailSolusi = detailSolusi;
      await data.save();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil melakukan revisi data kasus baru",
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

      const prevBasisPengetahuan = await BasisPengetahuan.find({
        hamaPenyakit: {
          $in: data?.detailPenyakit?.map((value) => value?._id),
        },
      })
        .populate({
          path: "gejala",
          select: "_id kode",
          model: "Gejala",
        })
        .populate({
          path: "solusi",
          select: "_id kode",
          model: "Solusi",
        });

      const _kodePrevGejala = [];
      prevBasisPengetahuan.forEach((element) => {
        element?.gejala?.forEach((valueGejala) => {
          _kodePrevGejala.push(valueGejala?.kode);
        });
      });
      const _kodePrevSolusi = [];
      prevBasisPengetahuan.forEach((element) => {
        element?.solusi?.forEach((valueSolusi) => {
          _kodePrevSolusi.push(valueSolusi?.kode);
        });
      });

      const _kodeSelectedGejala = [];
      data?.selectedGejala?.forEach((value) => {
        _kodeSelectedGejala.push(value?.kode);
      });
      const _kodeDetailSolusi = [];
      data?.detailSolusi?.forEach((value) => {
        _kodeDetailSolusi.push(value?.kode);
      });

      const _tempGejala = _kodePrevGejala.concat(_kodeSelectedGejala);
      const _tempSolusi = _kodePrevSolusi.concat(_kodeDetailSolusi);

      const uniqueKodeGejala = [...new Set(_tempGejala)];
      const uniqueKodeSolusi = [...new Set(_tempSolusi)];

      const gejala = await Gejala.find({
        kode: {
          $in: uniqueKodeGejala,
        },
      }).select("_id");
      const solusi = await Solusi.find({
        kode: {
          $in: uniqueKodeSolusi,
        },
      }).select("_id");

      const replaceBasisPengetahuan = await BasisPengetahuan.updateMany(
        {
          hamaPenyakit: {
            $in: data?.detailPenyakit?.map((value) => value?._id),
          },
        },
        {
          gejala,
          solusi,
        }
      );

      data.isVerified = true;
      await data.save();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message:
          "Berhasil melakukan verifikasi kasus baru, kasus baru sudah dipindahkan ke basis kasus!",
        data: {
          replaceBasisPengetahuan,
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
        message: "Berhasil menghapus data kasus baru!",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
