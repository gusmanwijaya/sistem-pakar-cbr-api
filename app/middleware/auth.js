const CustomError = require("../error");
const verifyJwt = require("../utils/verifyJwt");

const authenticationUsers = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      throw new CustomError.Forbidden("Silahkan login terlebih dahulu");
    }

    const payload = verifyJwt(token);

    req.user = {
      _id: payload._id,
      nama: payload.nama,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.Unauthorized(
        "Anda ditolak untuk mengakses route ini"
      );
    }
    next();
  };
};

module.exports = { authenticationUsers, authorizeRoles };
