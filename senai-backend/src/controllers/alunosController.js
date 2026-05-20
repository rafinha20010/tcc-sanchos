// src/controllers/alunosController.js
const { pool } = require("../config/database");

// GET /api/alunos — Lista todos os alunos com nome da turma
async function listar(req, res) {
  try {
    const { busca, turma_id, status } = req.query;

    let sql = `
      SELECT 
        a.id,
        a.nome,
        a.cpf,
        a.matricula,
        a.rfid,
        a.foto,
        a.telefone,
        a.nome_responsavel,
        a.turmas_id,
        t.nome AS turma_nome,
        -- Busca o último acesso do aluno
        (SELECT ra.data_hora 
         FROM facialtcc.registros_acessos ra 
         WHERE ra.alunos_id = a.id 
         ORDER BY ra.data_hora DESC 
         LIMIT 1) AS ultimo_acesso
      FROM facialtcc.alunos a
      INNER JOIN facialtcc.turmas t ON a.turmas_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (busca) {
      sql += ` AND (a.nome LIKE ? OR a.matricula LIKE ? OR a.rfid LIKE ?)`;
      params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
    }

    if (turma_id) {
      sql += ` AND a.turmas_id = ?`;
      params.push(turma_id);
    }

    sql += ` ORDER BY a.nome ASC`;

    const [alunos] = await pool.query(sql, params);

    res.json({
      success: true,
      total: alunos.length,
      data: alunos,
    });
  } catch (err) {
    console.error("Erro ao listar alunos:", err);
    res.status(500).json({ success: false, message: "Erro ao buscar alunos." });
  }
}

// GET /api/alunos/:id — Busca um aluno pelo ID
async function buscarPorId(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT a.*, t.nome AS turma_nome
       FROM facialtcc.alunos a
       INNER JOIN facialtcc.turmas t ON a.turmas_id = t.id
       WHERE a.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Aluno não encontrado." });
    }

    // Busca os últimos 10 registros de acesso do aluno
    const [registros] = await pool.query(
      `SELECT * FROM facialtcc.registros_acessos 
       WHERE alunos_id = ? 
       ORDER BY data_hora DESC 
       LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      data: { ...rows[0], historico_acessos: registros },
    });
  } catch (err) {
    console.error("Erro ao buscar aluno:", err);
    res.status(500).json({ success: false, message: "Erro ao buscar aluno." });
  }
}

// POST /api/alunos — Cadastra novo aluno
async function criar(req, res) {
  try {
    const { nome, cpf, matricula, rfid, telefone, nome_responsavel, turmas_id, foto } = req.body;

    // Validações básicas
    if (!nome || !cpf || !matricula || !rfid || !telefone || !nome_responsavel || !turmas_id) {
      return res.status(400).json({
        success: false,
        message: "Todos os campos obrigatórios devem ser preenchidos.",
        campos_obrigatorios: ["nome", "cpf", "matricula", "rfid", "telefone", "nome_responsavel", "turmas_id"],
      });
    }

    // Verifica se CPF já existe
    const [cpfExiste] = await pool.query(
      "SELECT id FROM facialtcc.alunos WHERE cpf = ?",
      [cpf]
    );
    if (cpfExiste.length > 0) {
      return res.status(409).json({ success: false, message: "CPF já cadastrado." });
    }

    // Verifica se matrícula já existe
    const [matExiste] = await pool.query(
      "SELECT id FROM facialtcc.alunos WHERE matricula = ?",
      [matricula]
    );
    if (matExiste.length > 0) {
      return res.status(409).json({ success: false, message: "Matrícula já cadastrada." });
    }

    // Verifica se RFID já existe
    const [rfidExiste] = await pool.query(
      "SELECT id FROM facialtcc.alunos WHERE rfid = ?",
      [rfid]
    );
    if (rfidExiste.length > 0) {
      return res.status(409).json({ success: false, message: "Tag RFID já vinculada a outro aluno." });
    }

    // Verifica se a turma existe
    const [turmaExiste] = await pool.query(
      "SELECT id FROM facialtcc.turmas WHERE id = ?",
      [turmas_id]
    );
    if (turmaExiste.length === 0) {
      return res.status(404).json({ success: false, message: "Turma não encontrada." });
    }

    // Insere o aluno
    const fotoFinal = foto || "default.jpg";
    const [result] = await pool.query(
      `INSERT INTO facialtcc.alunos (nome, cpf, matricula, rfid, foto, telefone, nome_responsavel, turmas_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, cpf, matricula, rfid, fotoFinal, telefone, nome_responsavel, turmas_id]
    );

    res.status(201).json({
      success: true,
      message: "Aluno cadastrado com sucesso!",
      data: { id: result.insertId, nome, matricula },
    });
  } catch (err) {
    console.error("Erro ao criar aluno:", err);
    res.status(500).json({ success: false, message: "Erro ao cadastrar aluno." });
  }
}

// PUT /api/alunos/:id — Atualiza um aluno
async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { nome, telefone, nome_responsavel, turmas_id, rfid, foto } = req.body;

    // Verifica se o aluno existe
    const [existe] = await pool.query("SELECT id FROM facialtcc.alunos WHERE id = ?", [id]);
    if (existe.length === 0) {
      return res.status(404).json({ success: false, message: "Aluno não encontrado." });
    }

    // Se vai trocar o RFID, verifica se já está em uso
    if (rfid) {
      const [rfidExiste] = await pool.query(
        "SELECT id FROM facialtcc.alunos WHERE rfid = ? AND id != ?",
        [rfid, id]
      );
      if (rfidExiste.length > 0) {
        return res.status(409).json({ success: false, message: "Tag RFID já vinculada a outro aluno." });
      }
    }

    await pool.query(
      `UPDATE facialtcc.alunos 
       SET nome = COALESCE(?, nome),
           telefone = COALESCE(?, telefone),
           nome_responsavel = COALESCE(?, nome_responsavel),
           turmas_id = COALESCE(?, turmas_id),
           rfid = COALESCE(?, rfid),
           foto = COALESCE(?, foto)
       WHERE id = ?`,
      [nome, telefone, nome_responsavel, turmas_id, rfid, foto, id]
    );

    res.json({ success: true, message: "Aluno atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar aluno:", err);
    res.status(500).json({ success: false, message: "Erro ao atualizar aluno." });
  }
}

// DELETE /api/alunos/:id — Remove um aluno
async function remover(req, res) {
  try {
    const { id } = req.params;

    const [existe] = await pool.query("SELECT id, nome FROM facialtcc.alunos WHERE id = ?", [id]);
    if (existe.length === 0) {
      return res.status(404).json({ success: false, message: "Aluno não encontrado." });
    }

    // Remove registros de acesso vinculados primeiro (integridade referencial)
    await pool.query("DELETE FROM facialtcc.registros_acessos WHERE alunos_id = ?", [id]);
    await pool.query("DELETE FROM facialtcc.alunos WHERE id = ?", [id]);

    res.json({
      success: true,
      message: `Aluno "${existe[0].nome}" removido com sucesso.`,
    });
  } catch (err) {
    console.error("Erro ao remover aluno:", err);
    res.status(500).json({ success: false, message: "Erro ao remover aluno." });
  }
}

// POST /api/alunos/verificar-rfid — Verifica se RFID já existe (para feedback em tempo real)
async function verificarRfid(req, res) {
  try {
    const { rfid, excluir_id } = req.body;

    let sql = "SELECT id, nome FROM facialtcc.alunos WHERE rfid = ?";
    const params = [rfid];

    if (excluir_id) {
      sql += " AND id != ?";
      params.push(excluir_id);
    }

    const [rows] = await pool.query(sql, params);

    res.json({
      success: true,
      disponivel: rows.length === 0,
      vinculado_a: rows.length > 0 ? rows[0].nome : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro ao verificar RFID." });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover, verificarRfid };
