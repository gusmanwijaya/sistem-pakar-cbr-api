const NotFound = (req, res) =>
  res.status(404).json({
    statusCode: 404,
    message: "Route tidak tersedia!",
  });

module.exports = NotFound;
