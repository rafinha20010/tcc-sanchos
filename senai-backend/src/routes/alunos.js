// src/routes/alunos.js
const express = require("express");
const router = express.Router();
const c = require("../controllers/alunosController");
const auth = require("../middleware/auth");

// Todas as rotas de alunos precisam de autenticação
router.use(auth);

router.get("/",              c.listar);
router.get("/:id",           c.buscarPorId);
router.post("/",             c.criar);
router.put("/:id",           c.atualizar);
router.delete("/:id",        c.remover);
router.post("/verificar-rfid", c.verificarRfid);

module.exports = router;
