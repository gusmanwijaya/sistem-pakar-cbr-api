const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data dashboard",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  },
};
