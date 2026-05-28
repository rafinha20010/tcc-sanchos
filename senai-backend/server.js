// src/server.js — Ponto de entrada do SENAI Monitor Backend
const dotenv = require ('dotenv');
dotenv.config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { testConnection } = require("./src/config/database");
const app = express();


// ─── MIDDLEWARES GLOBAIS ────────────────────────────────────────────────────

// CORS: permite requisições do frontend Next.js
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Parse de JSON e formulários
app.use(express.json({ limit: "10mb" }));  // 10mb para aceitar fotos base64
app.use(express.urlencoded({ extended: true }));

// Serve arquivos de upload estaticamente
// Acesse com: http://localhost:3001/uploads/nome_do_arquivo.jpg
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ─── LOG DE REQUISIÇÕES (desenvolvimento) ──────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString("pt-BR");
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  });
}

// ─── ROTAS DA API ───────────────────────────────────────────────────────────
app.use("/api/auth",        require("./src/routes/auth"));
app.use("/api/alunos",      require("./src/routes/alunos"));
app.use("/api/professores", require("./src/routes/professores"));
app.use("/api/turmas",      require("./src/routes/turmas"));
app.use("/api/registros",   require("./src/routes/registros"));
app.use("/api/upload",      require("./src/routes/upload"));

// ─── ROTA RAIZ (health check) ───────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    sistema: "SENAI Monitor API",
    versao: "1.0.0",
    status: "online",
    horario: new Date().toLocaleString("pt-BR"),
    rotas_disponiveis: [
      "POST   /api/auth/login",
      "GET    /api/auth/me",
      "GET    /api/alunos",
      "POST   /api/alunos",
      "GET    /api/alunos/:id",
      "PUT    /api/alunos/:id",
      "DELETE /api/alunos/:id",
      "GET    /api/professores",
      "POST   /api/professores",
      "GET    /api/turmas",
      "POST   /api/turmas",
      "GET    /api/registros",
      "GET    /api/registros/hoje",
      "GET    /api/registros/stats",
      "POST   /api/registros/rfid",
      "POST   /api/registros/facial",
      "POST   /api/upload/foto",
      "POST   /api/upload/foto-base64",
    ],
  });
});

// ─── TRATAMENTO DE ERROS GLOBAL ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);
  res.status(500).json({
    success: false,
    message: "Erro interno do servidor.",
    ...(process.env.NODE_ENV === "development" && { detalhes: err.message }),
  });
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.path} não encontrada.`,
  });
});

// ─── INICIALIZAÇÃO ───────────────────────────────────────────────────────────
async function iniciar() {
  await testConnection(); // Testa o banco antes de abrir o servidor

  app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`)
  });
}

iniciar();
