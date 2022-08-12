const express = require("express");
const router = express.Router();

const {
  getPertanyaan,
  proses,
  getRiwayatIdentifikasi,
  getOneRiwayatIdentifikasi,
  destroy,
} = require("./controller");
const {
  authenticationUsers,
  authorizeRoles,
} = require("../../../middleware/auth");

router.use(authenticationUsers);

router.get("/get-pertanyaan", authorizeRoles("pakar", "petani"), getPertanyaan);
router.get(
  "/get-riwayat-identifikasi",
  authorizeRoles("pakar", "petani"),
  getRiwayatIdentifikasi
);
router.get(
  "/get-one-riwayat-identifikasi/:id",
  authorizeRoles("pakar", "petani"),
  getOneRiwayatIdentifikasi
);
router.post("/proses", authorizeRoles("pakar", "petani"), proses);
router.delete("/destroy/:id", authorizeRoles("pakar"), destroy);

module.exports = router;
