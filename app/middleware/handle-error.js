const { StatusCodes } = require("http-status-codes");

const handleErrorMiddleware = (error, req, res, next) => {
  let customError = {
    statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: error.message || "Terjadi masalah, silahkan coba lagi!",
  };

  if (error.name === "ValidationError") {
    customError.statusCode = 400;
    customError.message = Object.values(error.errors)
      .map((value) => value.message)
      .join(", ");
  }

  if (error.code && error.code === 11000) {
    customError.statusCode = 400;
    customError.message = `Duplikat value untuk field ${Object.keys(
      error.keyValue
    )}, tolong masukkan value yang lain!`;
  }

  if (error.name === "CastError") {
    customError.statusCode = 404;
    customError.message = `Data dengan id : ${error.value} tidak tersedia!`;
  }

  return res.status(customError.statusCode).json({
    statusCode: customError.statusCode,
    message: customError.message,
  });
};

module.exports = handleErrorMiddleware;
