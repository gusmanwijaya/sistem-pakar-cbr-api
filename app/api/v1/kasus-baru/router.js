const express = require("express");
const router = express.Router();

const {
  getAll,
  confirmVerified,
  destroy,
  getOne,
  revisi,
} = require("./controller");
const {
  authenticationUsers,
  authorizeRoles,
} = require("../../../middleware/auth");

router.use(authenticationUsers);
authorizeRoles("pakar");

router.get("/get-all", getAll);
router.get("/get-one/:id", getOne);
router.post("/confirm-verified/:id", confirmVerified);
router.put("/revisi/:id", revisi);
router.delete("/destroy/:id", destroy);

module.exports = router;
