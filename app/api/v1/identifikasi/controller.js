const Gejala = require("../gejala/model");
const BasisPengetahuan = require("../basis-pengetahuan/model");
const Identifikasi = require("./model");
const HamaPenyakit = require("../hama-penyakit/model");
const Solusi = require("../solusi/model");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");
const moment = require("moment");

module.exports = {
  getPertanyaan: async (req, res, next) => {
    try {
      const data = await Gejala.find().select("_id kode nama bobot");

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data pertanyaan",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  getRiwayatIdentifikasi: async (req, res, next) => {
    try {
      const { user, isVerified, page = 1, limit = 10 } = req.query;

      let condition = {};

      if (user) {
        condition = {
          ...condition,
          user,
        };
      }

      if (isVerified) {
        condition = {
          ...condition,
          isVerified,
        };
      }

      const data = await Identifikasi.find(condition)
        .select(
          "_id user date selectedGejala allPenyakitnGejala processData detailPenyakit detailSolusi isVerified responseHasil"
        )
        .populate({
          path: "user",
          select: "_id nama email role",
          model: "User",
        })
        .limit(limit)
        .skip(limit * (page - 1));

      const count = await Identifikasi.countDocuments(condition);

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data riwayat identifikasi",
        current_page: parseInt(page),
        total_page: Math.ceil(count / limit),
        total_data: count,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  getOneRiwayatIdentifikasi: async (req, res, next) => {
    try {
      const { id: riwayatId } = req.params;

      const data = await Identifikasi.findOne({ _id: riwayatId })
        .select(
          "_id user date selectedGejala allPenyakitnGejala processData detailPenyakit detailSolusi isVerified responseHasil"
        )
        .populate({
          path: "user",
          select: "_id nama email role",
          model: "User",
        });

      if (!data)
        throw new CustomError.NotFound(
          `Riwayat identifikasi dengan id ${riwayatId} tidak ditemukan`
        );

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data detail riwayat identifikasi",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  destroy: async (req, res, next) => {
    try {
      const { id: riwayatId } = req.params;

      let data = await Identifikasi.findOne({ _id: riwayatId });

      if (!data)
        throw new CustomError.NotFound(
          `Riwayat identifikasi dengan id ${riwayatId} tidak ditemukan`
        );

      await data.remove();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data riwayat identifikasi berhasil dihapus",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  proses: async (req, res, next) => {
    try {
      // START: Mengambil gejala yang dipilih oleh pengguna (Kasus baru)
      const { idSelectedGejala } = req.body;
      const selectedGejala = await Gejala.find({
        _id: { $in: JSON.parse(idSelectedGejala) },
      }).select("_id kode nama bobot");
      // END: Mengambil gejala yang dipilih oleh pengguna (Kasus baru)

      // START: Mengambil gejala yang ada di basis pengetahuan (Kasus lama)
      const allPenyakitnGejala = await BasisPengetahuan.find()
        .select("_id hamaPenyakit gejala solusi")
        .populate({
          path: "hamaPenyakit",
          select: "_id kode nama deskripsi foto",
          model: "HamaPenyakit",
        })
        .populate({
          path: "solusi",
          select: "_id kode solusi",
          model: "Solusi",
        })
        .populate({
          path: "gejala",
          select: "_id kode nama bobot",
          model: "Gejala",
        });
      // END: Mengambil gejala yang ada di basis pengetahuan (Kasus lama)

      // START: Mengambil nama hama dan id gejala pada kasus lama untuk diproses & Mengambil id gejala yang dipilih oleh pengguna
      let _tempKasusLama = [];
      allPenyakitnGejala.map((value) =>
        _tempKasusLama.push({
          hamaPenyakit: value?.hamaPenyakit?.nama || "-",
          idGejala: value?.gejala.map((value) => value?._id),
        })
      );

      const _tempKasusBaru = JSON.parse(idSelectedGejala);
      // END: Mengambil nama hama dan id gejala pada kasus lama untuk diproses & Mengambil id gejala yang dipilih oleh pengguna

      // START: Membandingkan kasus baru dan kasus lama, jika kasus baru dan kasus lama sama maka nilai 1
      let _tempMembandingkanKasusBaruDanKasusLama = [];
      _tempKasusLama.map((valTempKasusLama) =>
        _tempMembandingkanKasusBaruDanKasusLama.push({
          hamaPenyakit: valTempKasusLama?.hamaPenyakit,
          data: valTempKasusLama?.idGejala.map((valIdGejala) =>
            _tempKasusBaru.includes(valIdGejala.toString()) ? 1 : 0
          ),
        })
      );
      // END: Membandingkan kasus baru dan kasus lama, jika kasus baru dan kasus lama sama maka nilai 1

      // START: Mengambil bobot pada gejala yang sama antara gejala yang dipilih pengguna dan gejala yang ada di basis pengetahuan
      let _tempUntukBobotGejalaSama = [];
      _tempKasusLama.map((valTempKasusLama) =>
        _tempUntukBobotGejalaSama.push({
          hamaPenyakit: valTempKasusLama?.hamaPenyakit,
          data: valTempKasusLama?.idGejala
            .map((valIdGejala) =>
              selectedGejala
                .map(
                  (valSelectedGejala) =>
                    _tempKasusBaru.includes(valIdGejala.toString()) &&
                    valSelectedGejala?._id.toString() ===
                      valIdGejala.toString() &&
                    valSelectedGejala?.bobot
                )
                .filter((result) => typeof result === "number")
                .join()
            )
            .filter((result) => result !== ""),
        })
      );

      let convertBobotStringToNumber = [];
      _tempUntukBobotGejalaSama.map((value) =>
        convertBobotStringToNumber.push({
          hamaPenyakit: value?.hamaPenyakit,
          data: value?.data.map((result) => parseInt(result)),
        })
      );
      // END: Mengambil bobot pada gejala yang sama antara gejala yang dipilih pengguna dan gejala yang ada di basis pengetahuan

      // START: Mengambil bobot gejala setiap kasus atau hama
      let _tempUntukBobotGejalaKasus = [];
      allPenyakitnGejala.map((value) =>
        _tempUntukBobotGejalaKasus.push({
          hamaPenyakit: value?.hamaPenyakit?.nama,
          data: value?.gejala.map((valGejala) => valGejala?.bobot),
        })
      );
      // END: Mengambil bobot gejala setiap kasus atau hama

      // START: Menampilkan data : nama hama, jumlah gejala sama, jumlah gejala kasus, jumlah gejala dipilih, bobot gejala sama, dan bobot gejala kasus
      let _tempData = [];
      _tempMembandingkanKasusBaruDanKasusLama.map((element) =>
        _tempData.push({
          hamaPenyakit: element?.hamaPenyakit,
          jumlahGejalaSama: _tempMembandingkanKasusBaruDanKasusLama
            .map(
              (valTempUntukJumlahGejalaSama) =>
                valTempUntukJumlahGejalaSama?.hamaPenyakit ===
                  element?.hamaPenyakit &&
                valTempUntukJumlahGejalaSama?.data.filter(
                  (value) => value === 1
                ).length
            )
            .filter((result) => typeof result === "number")[0],
          jumlahGejalaKasus: _tempMembandingkanKasusBaruDanKasusLama
            .map(
              (valTempUntukJumlahGejalaSama) =>
                valTempUntukJumlahGejalaSama?.hamaPenyakit ===
                  element?.hamaPenyakit &&
                valTempUntukJumlahGejalaSama?.data.length
            )
            .filter((result) => typeof result === "number")[0],
          jumlahGejalaDipilih: _tempKasusBaru.length,
          bobotGejalaSama: convertBobotStringToNumber
            .map(
              (value) =>
                value?.hamaPenyakit === element?.hamaPenyakit &&
                value?.data.reduce((acc, cur) => acc + cur, 0)
            )
            .filter((result) => typeof result === "number")[0],
          bobotGejalaKasus: _tempUntukBobotGejalaKasus
            .map(
              (value) =>
                value?.hamaPenyakit === element?.hamaPenyakit &&
                value?.data.reduce((acc, cur) => acc + cur, 0)
            )
            .filter((result) => typeof result === "number")[0],
        })
      );
      // END: Menampilkan data : nama hama, jumlah gejala sama, jumlah gejala kasus, jumlah gejala dipilih, bobot gejala sama, dan bobot gejala kasus

      // START: Proses menghitung similarity
      let processData = [];
      _tempData.map((value) =>
        processData.push({
          hamaPenyakit: value?.hamaPenyakit || "-",
          jumlahGejalaSama: value?.jumlahGejalaSama || "-",
          jumlahGejalaKasus: value?.jumlahGejalaKasus || "-",
          jumlahGejalaDipilih: value?.jumlahGejalaDipilih || "-",
          bobotGejalaSama: value?.bobotGejalaSama || "-",
          bobotGejalaKasus: value?.bobotGejalaKasus || "-",
          similarity:
            (value?.bobotGejalaSama / value?.bobotGejalaKasus).toString()
              .length > 4
              ? (value?.bobotGejalaSama / value?.bobotGejalaKasus).toFixed(2)
              : value?.bobotGejalaSama / value?.bobotGejalaKasus,
          similarityPersen:
            (value?.bobotGejalaSama / value?.bobotGejalaKasus).toString()
              .length > 4
              ? parseFloat(
                  (value?.bobotGejalaSama / value?.bobotGejalaKasus).toFixed(2)
                ) *
                  100 +
                "%"
              : (value?.bobotGejalaSama / value?.bobotGejalaKasus) * 100 + "%",
        })
      );
      // END: Proses menghitung similarity

      // START: Proses sorting berdasarkan similarity terbesar ke terkecil
      processData.sort((a, b) => {
        return b?.similarity - a?.similarity;
      });
      // END: Proses sorting berdasarkan similarity terbesar ke terkecil

      // START: Mengambil detail dari penyakit dengan nilai similarity terbesar
      let _tempNamaHamaPenyakit = [];
      for (let index = 0; index < processData.length; index++) {
        const element = processData[index];

        if (element?.similarity === processData[0]?.similarity) {
          _tempNamaHamaPenyakit.push(element?.hamaPenyakit);
        }
      }

      const responseDetailPenyakit = await HamaPenyakit.find({
        nama: {
          $in: _tempNamaHamaPenyakit,
        },
      }).select("_id kode nama deskripsi foto");

      const responseHasil = await BasisPengetahuan.find({
        hamaPenyakit: {
          $in: responseDetailPenyakit,
        },
      })
        .select("_id hamaPenyakit gejala solusi")
        .populate({
          path: "hamaPenyakit",
          select: "_id kode nama deskripsi foto",
          model: "HamaPenyakit",
        })
        .populate({
          path: "solusi",
          select: "_id kode solusi",
          model: "Solusi",
        })
        .populate({
          path: "gejala",
          select: "_id kode nama bobot",
          model: "Gejala",
        });

      const concatSolusi = [];
      responseHasil.forEach((element) => {
        element?.solusi?.forEach((value) => concatSolusi.push(value?.kode));
      });
      const uniqueSolusi = [...new Set(concatSolusi)];
      const detailSolusi = await Solusi.find({
        kode: {
          $in: uniqueSolusi,
        },
      }).select("_id kode solusi");
      // END: Mengambil detail dari penyakit dengan nilai similarity terbesar

      // START: Simpan data ke database
      const data = await Identifikasi.create({
        user: req?.user?._id,
        date: moment().format("MMMM DD YYYY, hh:mm:ss a"),
        selectedGejala,
        allPenyakitnGejala: allPenyakitnGejala.map((value) => ({
          _id: value?._id,
          hamaPenyakit: {
            _id: value?.hamaPenyakit?._id,
            kode: value?.hamaPenyakit?.kode,
            nama: value?.hamaPenyakit?.nama,
            deskripsi: value?.hamaPenyakit?.deskripsi,
            foto: value?.hamaPenyakit?.foto,
          },
          gejala: value?.gejala.map((result) => ({
            _id: result?._id,
            kode: result?.kode,
            nama: result?.nama,
            bobot: result?.bobot,
          })),
          solusi: value?.solusi.map((result) => ({
            _id: result?._id,
            kode: result?.kode,
            solusi: result?.solusi,
          })),
        })),
        processData,
        detailPenyakit: responseHasil?.map((valueDetailPenyakit) => ({
          _id: valueDetailPenyakit?.hamaPenyakit?._id,
          kode: valueDetailPenyakit?.hamaPenyakit?.kode,
          nama: valueDetailPenyakit?.hamaPenyakit?.nama,
          deskripsi: valueDetailPenyakit?.hamaPenyakit?.deskripsi,
          foto: valueDetailPenyakit?.hamaPenyakit?.foto,
        })),
        detailSolusi,
        isVerified: processData[0]?.similarity < 0.5 ? false : true,
        responseHasil: responseHasil?.map((valueResponseHasil) => ({
          _id: valueResponseHasil?._id,
          hamaPenyakit: {
            _id: valueResponseHasil?.hamaPenyakit?._id,
            kode: valueResponseHasil?.hamaPenyakit?.kode,
            nama: valueResponseHasil?.hamaPenyakit?.nama,
            deskripsi: valueResponseHasil?.hamaPenyakit?.deskripsi,
            foto: valueResponseHasil?.hamaPenyakit?.foto,
          },
          solusi: valueResponseHasil?.solusi?.map((valueSolusi) => ({
            _id: valueSolusi?._id,
            kode: valueSolusi?.kode,
            solusi: valueSolusi?.solusi,
          })),
        })),
      });
      // END: Simpan data ke database

      // START: Memberikan response API ke Front-end atau aplikasi yang akan menggunakan
      res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        message: "Berhasil melakukan identifikasi",
        data,
      });
      // END: Memberikan response API ke Front-end atau aplikasi yang akan menggunakan
    } catch (error) {
      next(error);
    }
  },
};
