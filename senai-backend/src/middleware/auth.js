// src/middleware/auth.js
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  // Pega o token do header Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Acesso negado. Token não fornecido.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, nome }
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Token inválido ou expirado. Faça login novamente.",
    });
  }
}

module.exports = authMiddleware;
