const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const directory = req.baseUrl.split("/")[req.baseUrl.split("/").length - 1];
    callback(null, `public/uploads/${directory}/`);
  },
  filename: function (req, file, callback) {
    callback(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    callback(null, true);
  } else {
    callback({ message: "Format file tidak didukung" }, false);
  }
};

const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10000000, //10MB
  },
  fileFilter,
});

module.exports = uploadMiddleware;
