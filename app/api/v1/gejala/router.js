const express = require("express");
const router = express.Router();

const {
  getAll,
  create,
  update,
  destroy,
  getOne,
  getForSelect,
} = require("./controller");
const {
  authenticationUsers,
  authorizeRoles,
} = require("../../../middleware/auth");

router.use(authenticationUsers);
router.use(authorizeRoles("pakar"));

router.get("/get-all", getAll);
router.get("/get-for-select", getForSelect);
router.get("/get-one/:id", getOne);
router.post("/create", create);
router.put("/update/:id", update);
router.delete("/destroy/:id", destroy);

module.exports = router;
