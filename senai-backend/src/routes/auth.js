// src/routes/auth.js
const express = require("express");
const router = express.Router();
const { login, verificarToken } = require("../controllers/authController");
const auth = require("../middleware/auth");

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me — Verifica se o token é válido
router.get("/me", auth, verificarToken);

// PUT /api/auth — atualiza email/nome/senha do admin (protegido)
router.put("/", auth, require("../controllers/authController").atualizarAdmin);

module.exports = router;
