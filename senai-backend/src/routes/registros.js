// src/routes/registros.js
const express = require("express");
const router = express.Router();
const c = require("../controllers/registrosController");
const auth = require("../middleware/auth");

// Rotas públicas (chamadas por hardware externo — leitor RFID, câmera)
// Em produção: proteja com uma API Key de dispositivo
router.post("/rfid",   c.registrarRfid);
router.post("/facial", c.registrarFacial);

// Rotas protegidas por JWT
router.use(auth);

router.get("/",      c.listar);
router.get("/hoje",  c.hoje);
router.get("/stats", c.stats);
router.post("/",     c.registrar);

module.exports = router;
