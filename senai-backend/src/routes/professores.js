// src/routes/professores.js
const express = require("express");
const router = express.Router();
const c = require("../controllers/professoresController");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/",     c.listar);
router.get("/:id",  c.buscarPorId);
router.post("/",    c.criar);
router.put("/:id",  c.atualizar);
router.delete("/:id", c.remover);

module.exports = router;
