// src/config/database.js
const mysql = require("mysql2/promise");
require("dotenv").config();

// Pool de conexões (melhor que uma única conexão)
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "facialtcc",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Converte automaticamente datas do MySQL para objetos Date do JS
  dateStrings: false,
  timezone: "-03:00", // Horário de Brasília
});

// Testa a conexão ao iniciar
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conectado ao MySQL com sucesso!");
    console.log(`   Banco: ${process.env.DB_NAME} | Host: ${process.env.DB_HOST}`);
    connection.release();
  } catch (error) {
    console.error("❌ Erro ao conectar ao MySQL:", error.message);
    console.error("   Verifique as variáveis de ambiente no arquivo .env");
    process.exit(1); // Encerra o servidor se não conseguir conectar
  }
}

module.exports = { pool, testConnection };
