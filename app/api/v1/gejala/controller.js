const Gejala = require("./model");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const data = await Gejala.find()
        .select("_id kode nama bobot")
        .limit(limit)
        .skip(limit * (page - 1));

      const count = await Gejala.countDocuments();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data gejala",
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
      const data = await Gejala.find().select("_id kode nama bobot");

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data gejala",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  getOne: async (req, res, next) => {
    try {
      const { id: gejalaId } = req.params;

      const data = await Gejala.findOne({ _id: gejalaId }).select(
        "_id kode nama bobot"
      );

      if (!data)
        throw new CustomError.NotFound(
          `Gejala dengan id ${gejalaId} tidak ditemukan`
        );

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data gejala",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { kode, nama, bobot } = req.body;

      const checkKode = await Gejala.findOne({ kode }).select("kode");
      if (checkKode)
        throw new CustomError.BadRequest(
          `Kode : ${checkKode.kode} sudah terdaftar`
        );

      const checkNama = await Gejala.findOne({ nama }).select("nama");
      if (checkNama) throw new CustomError.BadRequest(`Nama sudah terdaftar`);

      const data = new Gejala({
        kode,
        nama,
        bobot,
      });
      await data.save();

      res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        message: "Data gejala berhasil ditambahkan",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id: gejalaId } = req.params;
      const { kode, nama, bobot } = req.body;

      const checkKode = await Gejala.findOne({
        _id: {
          $ne: gejalaId,
        },
        kode,
      }).select("kode");
      if (checkKode)
        throw new CustomError.BadRequest(
          `Kode : ${checkKode.kode} sudah terdaftar`
        );

      const checkNama = await Gejala.findOne({
        _id: {
          $ne: gejalaId,
        },
        nama,
      }).select("nama");
      if (checkNama) throw new CustomError.BadRequest(`Nama sudah terdaftar`);

      let data = await Gejala.findOne({ _id: gejalaId });

      if (!data)
        throw new CustomError.NotFound(
          `Gejala dengan id ${gejalaId} tidak ditemukan`
        );

      data.kode = kode;
      data.nama = nama;
      data.bobot = bobot;
      await data.save();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data gejala berhasil diubah",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  destroy: async (req, res, next) => {
    try {
      const { id: gejalaId } = req.params;

      let data = await Gejala.findOne({ _id: gejalaId });

      if (!data)
        throw new CustomError.NotFound(
          `Gejala dengan id ${gejalaId} tidak ditemukan`
        );

      await data.remove();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data gejala berhasil dihapus",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
