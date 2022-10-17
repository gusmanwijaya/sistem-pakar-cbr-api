const HamaPenyakit = require("./model");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");
const fs = require("fs");
const config = require("../../../config");

module.exports = {
  getAll: async (req, res, next) => {
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
        .select("_id kode nama foto deskripsi")
        .limit(limit)
        .skip(limit * (page - 1));

      const count = await HamaPenyakit.countDocuments(condition);

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data hama & penyakit",
        current_page: parseInt(page),
        total_page: Math.ceil(count / limit),
        total_data: count,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  getForSelect: async (req, res, next) => {
    try {
      const data = await HamaPenyakit.find().select(
        "_id kode nama foto deskripsi"
      );

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data hama & penyakit",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  getOne: async (req, res, next) => {
    try {
      const { id: hamaPenyakitId } = req.params;

      const data = await HamaPenyakit.findOne({ _id: hamaPenyakitId }).select(
        "_id kode nama foto deskripsi"
      );

      if (!data)
        throw new CustomError.NotFound(
          `Hama & penyakit dengan id ${hamaPenyakitId} tidak ditemukan`
        );

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data hama & penyakit",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { kode, nama, deskripsi } = req.body;

      const checkKode = await HamaPenyakit.findOne({ kode }).select("kode");
      if (checkKode)
        throw new CustomError.BadRequest(
          `Kode : ${checkKode.kode} sudah terdaftar`
        );

      const checkNama = await HamaPenyakit.findOne({ nama }).select("nama");
      if (checkNama)
        throw new CustomError.BadRequest(
          `Nama : ${checkNama.nama} sudah terdaftar`
        );

      let data;

      if (!req.file) {
        data = new HamaPenyakit({
          kode,
          nama,
          deskripsi,
        });
      } else {
        data = new HamaPenyakit({
          kode,
          nama,
          foto: req.file.filename,
          deskripsi,
        });
      }

      await data.save();

      res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        message: "Data hama & penyakit berhasil ditambahkan",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id: hamaPenyakitId } = req.params;
      const { kode, nama, deskripsi } = req.body;

      const checkKode = await HamaPenyakit.findOne({
        _id: {
          $ne: hamaPenyakitId,
        },
        kode,
      }).select("kode");
      if (checkKode)
        throw new CustomError.BadRequest(
          `Kode : ${checkKode.kode} sudah terdaftar`
        );

      const checkNama = await HamaPenyakit.findOne({
        _id: {
          $ne: hamaPenyakitId,
        },
        nama,
      }).select("nama");
      if (checkNama)
        throw new CustomError.BadRequest(
          `Nama : ${checkNama.nama} sudah terdaftar`
        );

      let data = await HamaPenyakit.findOne({ _id: hamaPenyakitId });

      if (!data)
        throw new CustomError.NotFound(
          `Hama & penyakit dengan id ${hamaPenyakitId} tidak ditemukan`
        );

      if (!req.file) {
        data.kode = kode;
        data.nama = nama;
        data.deskripsi = deskripsi;
      } else {
        const currentImage = `${config.rootPath}/public/uploads/hama-penyakit/${data.foto}`;

        if (fs.existsSync(currentImage)) {
          fs.unlinkSync(currentImage);
        }

        data.kode = kode;
        data.nama = nama;
        data.foto = req.file.filename;
        data.deskripsi = deskripsi;
      }

      await data.save();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data hama & penyakit berhasil diubah",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  destroy: async (req, res, next) => {
    try {
      const { id: hamaPenyakitId } = req.params;

      let data = await HamaPenyakit.findOne({ _id: hamaPenyakitId });

      if (!data)
        throw new CustomError.NotFound(
          `Hama & penyakit dengan id ${hamaPenyakitId} tidak ditemukan`
        );

      const currentImage = `${config.rootPath}/public/uploads/hama-penyakit/${data.foto}`;

      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage);
      }

      await data.remove();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data hama & penyakit berhasil dihapus",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
