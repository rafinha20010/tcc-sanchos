// src/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Carrega o admin a partir de um arquivo JSON para persistência simples
const ADMIN_FILE = path.join(__dirname, "../config/admin.json");

function loadAdmin() {
  try {
    const raw = fs.readFileSync(ADMIN_FILE, "utf8");
    const obj = JSON.parse(raw);
    // Garante valores padrão se faltarem
    return {
      id: obj.id || 1,
      nome: obj.nome || "Admin SENAI",
      email: obj.email || "admin@senai.br",
      senha: obj.senha || "admin123",
    };
  } catch (err) {
    // Se não existir, retorna padrão
    return { id: 1, nome: "Admin SENAI", email: "admin@senai.br", senha: "admin123" };
  }
}

function saveAdmin(admin) {
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), "utf8");
}

function getAdminWithHash() {
  const a = loadAdmin();
  return {
    id: a.id,
    nome: a.nome,
    email: a.email,
    senhaHash: bcrypt.hashSync(a.senha, 10),
  };
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: "E-mail e senha são obrigatórios.",
      });
    }

    const ADMIN_CURRENT = getAdminWithHash();
    // Verifica o e-mail
    if (email !== ADMIN_CURRENT.email) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas.",
      });
    }

    // Verifica a senha
    const senhaCorreta = await bcrypt.compare(senha, ADMIN_CURRENT.senhaHash);
    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas.",
      });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: ADMIN_CURRENT.id, email: ADMIN_CURRENT.email, nome: ADMIN_CURRENT.nome },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({
      success: true,
      message: "Login realizado com sucesso!",
      token,
      usuario: {
        id: ADMIN_CURRENT.id,
        nome: ADMIN_CURRENT.nome,
        email: ADMIN_CURRENT.email,
      },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ success: false, message: "Erro interno do servidor." });
  }
}

// Verifica se o token ainda é válido
function verificarToken(req, res) {
  res.json({
    success: true,
    usuario: req.user,
  });
}

// Atualiza o e-mail (e opcionalmente nome/senha) do admin — rota protegida
async function atualizarAdmin(req, res) {
  try {
    const { email, nome, senha } = req.body;
    if (!email && !nome && !senha) {
      return res.status(400).json({ success: false, message: "Nenhum dado para atualização." });
    }

    const current = loadAdmin();
    const updated = { ...current };
    if (email) updated.email = email;
    if (nome) updated.nome = nome;
    if (senha) updated.senha = senha;

    saveAdmin(updated);

    res.json({ success: true, message: "Admin atualizado com sucesso.", data: { email: updated.email, nome: updated.nome } });
  } catch (err) {
    console.error("Erro ao atualizar admin:", err);
    res.status(500).json({ success: false, message: "Erro ao atualizar admin." });
  }
}

module.exports = { login, verificarToken, atualizarAdmin };
