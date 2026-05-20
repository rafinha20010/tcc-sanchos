// src/config/seed.js
// Popula o banco com dados iniciais para testes
const { pool } = require("./database");
const bcrypt = require("bcryptjs");

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log("🌱 Iniciando seed do banco de dados...\n");

    // --- Turmas ---
    await conn.query(`
      INSERT IGNORE INTO facialtcc.turmas (id, nome) VALUES
      (1, 'IDEV3 - Desenvolvimento de Sistemas 3'),
      (2, 'IDEV4 - Desenvolvimento de Sistemas 4'),
      (3, 'IDEV5 - Desenvolvimento de Sistemas 5'),
      (4, 'IELE4 - Eletrônica 4'),
      (5, 'IMEC5 - Mecânica 5')
    `);
    console.log("✅ Turmas inseridas");

    // --- Professores ---
    await conn.query(`
      INSERT IGNORE INTO facialtcc.professores (id, nome, cpf, rfid, foto, telefone) VALUES
      (1, 'João Marcos Oliveira', '111.222.333-44', 'PROF001', 'default.jpg', '(14) 99812-3456'),
      (2, 'Carla Andrade Silva',  '222.333.444-55', 'PROF002', 'default.jpg', '(14) 99823-4567'),
      (3, 'Ricardo Souza Lima',   '333.444.555-66', 'PROF003', 'default.jpg', '(14) 99834-5678')
    `);
    console.log("✅ Professores inseridos");

    // --- Alunos ---
    await conn.query(`
      INSERT IGNORE INTO facialtcc.alunos (id, nome, cpf, matricula, rfid, foto, telefone, nome_responsavel, turmas_id) VALUES
      (1, 'Isabela Longhi',    '444.555.666-77', 'MAT001', 'A23F91', 'default.jpg', '(14) 99900-0001', 'Roberto Longhi',    1),
      (2, 'Maria Oliveira',    '555.666.777-88', 'MAT002', 'B88K21', 'default.jpg', '(14) 99900-0002', 'Paulo Oliveira',    2),
      (3, 'Carlos Martins',    '666.777.888-99', 'MAT003', 'C55T77', 'default.jpg', '(14) 99900-0003', 'Ana Martins',       3),
      (4, 'Ana Minin',         '777.888.999-00', 'MAT004', 'D91R44', 'default.jpg', '(14) 99900-0004', 'Carlos Minin',      1),
      (5, 'Lucas Gregório',    '888.999.000-11', 'MAT005', 'E07P88', 'default.jpg', '(14) 99900-0005', 'Sandra Gregório',   2),
      (6, 'Otávio Seidinger',  '999.000.111-22', 'MAT006', 'F33X12', 'default.jpg', '(14) 99900-0006', 'Marcos Seidinger',  3),
      (7, 'Lucas Ferreira',    '000.111.222-33', 'MAT007', 'G74Y56', 'default.jpg', '(14) 99900-0007', 'Felipe Ferreira',   4),
      (8, 'Fernanda Rocha',    '111.222.333-55', 'MAT008', 'H12Z99', 'default.jpg', '(14) 99900-0008', 'Joana Rocha',       5)
    `);
    console.log("✅ Alunos inseridos");

    // --- Vínculo Turmas x Professores ---
    await conn.query(`
      INSERT IGNORE INTO facialtcc.turmas_has_professores (turmas_id, professores_id) VALUES
      (1, 1), (1, 2),
      (2, 1), (2, 3),
      (3, 2), (3, 3),
      (4, 2), (5, 3)
    `);
    console.log("✅ Vínculos turma-professor inseridos");

    // --- Registros de Acesso de exemplo ---
    await conn.query(`
      INSERT IGNORE INTO facialtcc.registros_acessos (tipo_identificacao, data_hora, tipo_acesso, alunos_id, professores_id) VALUES
      ('rfid',   NOW() - INTERVAL 2 HOUR,  'entrada', 1, NULL),
      ('facial', NOW() - INTERVAL 2 HOUR,  'entrada', 2, NULL),
      ('rfid',   NOW() - INTERVAL 1 HOUR,  'entrada', 3, NULL),
      ('facial', NOW() - INTERVAL 30 MINUTE, 'saida', 1, NULL),
      ('rfid',   NOW() - INTERVAL 10 MINUTE, 'entrada', NULL, 1)
    `);
    console.log("✅ Registros de acesso inseridos");

    console.log("\n🎉 Seed concluído com sucesso!");
  } catch (err) {
    console.error("❌ Erro no seed:", err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();
