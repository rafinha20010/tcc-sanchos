// src/config/database.js
const mysql = require("mysql2/promise");
const dotenv = require ('dotenv');
dotenv.config();

// Pool de conexões (melhor que uma única conexão)
const pool = mysql.createPool({
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  // waitForConnections: true,
  // connectionLimit: 10,
  // queueLimit: 0,
  // // Converte automaticamente datas do MySQL para objetos Date do JS
  // dateStrings: false,
  // timezone: "-03:00", // Horário de Brasília
});

// Testa a conexão ao iniciar
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conectado ao MySQL com sucesso!");
    connection.release();
  } catch (error) {
    console.error("❌ Erro ao conectar ao MySQL:", error);
    console.error("   Verifique as variáveis de ambiente no arquivo .env");
    process.exit(1); // Encerra o servidor se não conseguir conectar
  }
}

module.exports = { pool, testConnection };
