// src/controllers/turmasController.js
const { pool } = require("../config/database");

// GET /api/turmas
async function listar(req, res) {
  try {
    const [turmas] = await pool.query(`
      SELECT 
        t.id,
        t.nome,
        COUNT(DISTINCT a.id) AS total_alunos,
        GROUP_CONCAT(DISTINCT p.nome ORDER BY p.nome SEPARATOR ' | ') AS professores
      FROM facialtcc.turmas t
      LEFT JOIN facialtcc.alunos a ON a.turmas_id = t.id
      LEFT JOIN facialtcc.turmas_has_professores tp ON tp.turmas_id = t.id
      LEFT JOIN facialtcc.professores p ON p.id = tp.professores_id
      GROUP BY t.id, t.nome
      ORDER BY t.nome ASC
    `);

    res.json({ success: true, total: turmas.length, data: turmas });
  } catch (err) {
    console.error("Erro ao listar turmas:", err);
    res.status(500).json({ success: false, message: "Erro ao buscar turmas." });
  }
}

// GET /api/turmas/:id
async function buscarPorId(req, res) {
  try {
    const { id } = req.params;

    const [turma] = await pool.query(
      "SELECT * FROM facialtcc.turmas WHERE id = ?", [id]
    );
    if (turma.length === 0) {
      return res.status(404).json({ success: false, message: "Turma não encontrada." });
    }

    const [alunos] = await pool.query(
      "SELECT id, nome, matricula, rfid, foto FROM facialtcc.alunos WHERE turmas_id = ? ORDER BY nome",
      [id]
    );

    const [professores] = await pool.query(
      `SELECT p.id, p.nome, p.telefone FROM facialtcc.professores p
       INNER JOIN facialtcc.turmas_has_professores tp ON p.id = tp.professores_id
       WHERE tp.turmas_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: { ...turma[0], alunos, professores },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro ao buscar turma." });
  }
}

// POST /api/turmas
async function criar(req, res) {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ success: false, message: "Nome da turma é obrigatório." });
    }

    const [result] = await pool.query(
      "INSERT INTO facialtcc.turmas (nome) VALUES (?)", [nome]
    );

    res.status(201).json({
      success: true,
      message: "Turma criada com sucesso!",
      data: { id: result.insertId, nome },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro ao criar turma." });
  }
}

// PUT /api/turmas/:id
async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ success: false, message: "Nome é obrigatório." });
    }

    const [existe] = await pool.query("SELECT id FROM facialtcc.turmas WHERE id = ?", [id]);
    if (existe.length === 0) {
      return res.status(404).json({ success: false, message: "Turma não encontrada." });
    }

    await pool.query("UPDATE facialtcc.turmas SET nome = ? WHERE id = ?", [nome, id]);

    res.json({ success: true, message: "Turma atualizada com sucesso!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro ao atualizar turma." });
  }
}

// DELETE /api/turmas/:id
async function remover(req, res) {
  try {
    const { id } = req.params;

    const [alunosVinculados] = await pool.query(
      "SELECT COUNT(*) AS total FROM facialtcc.alunos WHERE turmas_id = ?", [id]
    );

    if (alunosVinculados[0].total > 0) {
      return res.status(409).json({
        success: false,
        message: `Não é possível remover. Existem ${alunosVinculados[0].total} aluno(s) nesta turma.`,
      });
    }

    await pool.query("DELETE FROM facialtcc.turmas_has_professores WHERE turmas_id = ?", [id]);
    await pool.query("DELETE FROM facialtcc.turmas WHERE id = ?", [id]);

    res.json({ success: true, message: "Turma removida com sucesso." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro ao remover turma." });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
