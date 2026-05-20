// src/routes/upload.js
const express = require("express");
const router = express.Router();
const { salvarFoto, salvarFotoBase64 } = require("../controllers/uploadController");
const auth = require("../middleware/auth");

router.use(auth);

// POST /api/upload/foto — Upload de arquivo (multipart/form-data)
router.post("/foto", salvarFoto);

// POST /api/upload/foto-base64 — Upload de imagem em base64 (usado pela webcam)
router.post("/foto-base64", salvarFotoBase64);

module.exports = router;
