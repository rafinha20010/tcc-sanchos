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
    // Aceita campos com nomes alternativos vindos do front-end
    const {
      nome,
      cpf,
      matricula,
      rfid,
      telefone,
      nome_responsavel,
      turmas_id,
      foto,
      ra,
      responsavel,
      turma,
      telefoneResponsavel,
    } = req.body;

    // Normaliza campos
    const matriculaFinal = matricula || ra;
    const nomeResponsavelFinal = nome_responsavel || responsavel || null;
    const telefoneFinal = telefone || telefoneResponsavel || null;
    let turmasIdFinal = turmas_id || null;

    // Validações mínimas: nome e matrícula e turma
    if (!nome || !matriculaFinal) {
      return res.status(400).json({
        success: false,
        message: "Campos obrigatórios ausentes. Pelo menos 'nome' e 'matrícula (ra)' são necessários.",
        campos_obrigatorios: ["nome", "matricula (ou ra)"],
      });
    }

    // Se não passou turmas_id diretamente, tenta resolver a partir de 'turma' (nome ou código)
    if (!turmasIdFinal && turma) {
      // Tenta buscar por nome parecido
      const [rows] = await pool.query(
        "SELECT id FROM facialtcc.turmas WHERE nome LIKE ? LIMIT 1",
        [`%${turma}%`]
      );
      if (rows.length > 0) turmasIdFinal = rows[0].id;
    }

    if (!turmasIdFinal) {
      return res.status(400).json({ success: false, message: "Turma (turmas_id) é obrigatória ou inválida." });
    }

    // Verificações condicionais: só valida CPF/matricula/rfid duplicados se informado
    if (cpf) {
      const [cpfExiste] = await pool.query(
        "SELECT id FROM facialtcc.alunos WHERE cpf = ?",
        [cpf]
      );
      if (cpfExiste.length > 0) {
        return res.status(409).json({ success: false, message: "CPF já cadastrado." });
      }
    }

    // Verifica se matrícula já existe
    const [matExiste] = await pool.query(
      "SELECT id FROM facialtcc.alunos WHERE matricula = ?",
      [matriculaFinal]
    );
    if (matExiste.length > 0) {
      return res.status(409).json({ success: false, message: "Matrícula já cadastrada." });
    }

    if (rfid) {
      const [rfidExiste] = await pool.query(
        "SELECT id FROM facialtcc.alunos WHERE rfid = ?",
        [rfid]
      );
      if (rfidExiste.length > 0) {
        return res.status(409).json({ success: false, message: "Tag RFID já vinculada a outro aluno." });
      }
    }

    // Confirma que a turma (resolvida) existe
    const [turmaExiste] = await pool.query(
      "SELECT id FROM facialtcc.turmas WHERE id = ?",
      [turmasIdFinal]
    );
    if (turmaExiste.length === 0) {
      return res.status(404).json({ success: false, message: "Turma não encontrada." });
    }

  // Normaliza caminho da foto para armazenar no banco como uploads/<filename>
    function fotoToPath(f) {
      if (!f) return "uploads/default.jpg";
      const s = String(f);
      if (s.startsWith("uploads/") || s.startsWith("/")) return s.startsWith("/") ? s.substring(1) : s;
      return `uploads/${s}`;
    }

    // Insere o aluno
    const fotoFinal = fotoToPath(foto);
    const [result] = await pool.query(
      `INSERT INTO facialtcc.alunos (nome, cpf, matricula, rfid, foto, telefone, nome_responsavel, turmas_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, cpf || null, matriculaFinal, rfid || null, fotoFinal, telefoneFinal, nomeResponsavelFinal, turmasIdFinal]
    );

    res.status(201).json({
      success: true,
      message: "Aluno cadastrado com sucesso!",
      data: { id: result.insertId, nome, matricula: matriculaFinal },
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

    // Normaliza foto se fornecida
    let fotoParaSalvar = foto;
    if (fotoParaSalvar) {
      const s = String(fotoParaSalvar);
      if (!s.startsWith("uploads/") && !s.startsWith("/")) {
        fotoParaSalvar = `uploads/${s}`;
      } else if (s.startsWith("/")) {
        fotoParaSalvar = s.substring(1);
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
      [nome, telefone, nome_responsavel, turmas_id, rfid, fotoParaSalvar, id]
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
