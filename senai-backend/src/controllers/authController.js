// src/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Usuário admin fixo (para TCC - em produção use banco de dados)
// Senha: admin123
const ADMIN = {
  id: 1,
  nome: "Admin SENAI",
  email: "admin@senai.br",
  // Hash de "admin123"
  senhaHash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyc5mzVj2",
};

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: "E-mail e senha são obrigatórios.",
      });
    }

    // Verifica o e-mail
    if (email !== ADMIN.email) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas.",
      });
    }

    // Verifica a senha
    const senhaCorreta = await bcrypt.compare(senha, ADMIN.senhaHash);
    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas.",
      });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: ADMIN.id, email: ADMIN.email, nome: ADMIN.nome },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({
      success: true,
      message: "Login realizado com sucesso!",
      token,
      usuario: {
        id: ADMIN.id,
        nome: ADMIN.nome,
        email: ADMIN.email,
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

module.exports = { login, verificarToken };
