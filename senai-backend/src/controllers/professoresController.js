// src/controllers/professoresController.js
const { pool } = require("../config/database");

// GET /api/professores
async function listar(req, res) {
  try {
    const { busca } = req.query;

    let sql = `
      SELECT 
        p.*,
        GROUP_CONCAT(DISTINCT t.nome ORDER BY t.nome SEPARATOR ' | ') AS turmas
      FROM facialtcc.professores p
      LEFT JOIN facialtcc.turmas_has_professores tp ON p.id = tp.professores_id
      LEFT JOIN facialtcc.turmas t ON tp.turmas_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (busca) {
      sql += ` AND (p.nome LIKE ? OR p.cpf LIKE ?)`;
      params.push(`%${busca}%`, `%${busca}%`);
    }

    sql += ` GROUP BY p.id ORDER BY p.nome ASC`;

    const [professores] = await pool.query(sql, params);

    res.json({ success: true, total: professores.length, data: professores });
  } catch (err) {
    console.error("Erro ao listar professores:", err);
    res.status(500).json({ success: false, message: "Erro ao buscar professores." });
  }
}

// GET /api/professores/:id
async function buscarPorId(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM facialtcc.professores WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Professor não encontrado." });
    }

    const [turmas] = await pool.query(
      `SELECT t.* FROM facialtcc.turmas t
       INNER JOIN facialtcc.turmas_has_professores tp ON t.id = tp.turmas_id
       WHERE tp.professores_id = ?`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...rows[0], turmas } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro ao buscar professor." });
  }
}

// POST /api/professores
async function criar(req, res) {
  try {
    const { nome, cpf, rfid, telefone, foto } = req.body;

    if (!nome || !cpf || !rfid || !telefone) {
      return res.status(400).json({
        success: false,
        message: "Campos obrigatórios: nome, cpf, rfid, telefone.",
      });
    }

    const [cpfExiste] = await pool.query(
      "SELECT id FROM facialtcc.professores WHERE cpf = ?", [cpf]
    );
    if (cpfExiste.length > 0) {
      return res.status(409).json({ success: false, message: "CPF já cadastrado." });
    }

    const [result] = await pool.query(
      `INSERT INTO facialtcc.professores (nome, cpf, rfid, foto, telefone)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, cpf, rfid, foto || "default.jpg", telefone]
    );

    res.status(201).json({
      success: true,
      message: "Professor cadastrado com sucesso!",
      data: { id: result.insertId, nome },
    });
  } catch (err) {
    console.error("Erro ao criar professor:", err);
    res.status(500).json({ success: false, message: "Erro ao cadastrar professor." });
  }
}

// PUT /api/professores/:id
async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { nome, telefone, rfid, foto } = req.body;

    const [existe] = await pool.query(
      "SELECT id FROM facialtcc.professores WHERE id = ?", [id]
    );
    if (existe.length === 0) {
      return res.status(404).json({ success: false, message: "Professor não encontrado." });
    }

    await pool.query(
      `UPDATE facialtcc.professores 
       SET nome = COALESCE(?, nome),
           telefone = COALESCE(?, telefone),
           rfid = COALESCE(?, rfid),
           foto = COALESCE(?, foto)
       WHERE id = ?`,
      [nome, telefone, rfid, foto, id]
    );

    res.json({ success: true, message: "Professor atualizado com sucesso!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro ao atualizar professor." });
  }
}

// DELETE /api/professores/:id
async function remover(req, res) {
  try {
    const { id } = req.params;

    const [existe] = await pool.query(
      "SELECT id, nome FROM facialtcc.professores WHERE id = ?", [id]
    );
    if (existe.length === 0) {
      return res.status(404).json({ success: false, message: "Professor não encontrado." });
    }

    await pool.query("DELETE FROM facialtcc.turmas_has_professores WHERE professores_id = ?", [id]);
    await pool.query("DELETE FROM facialtcc.registros_acessos WHERE professores_id = ?", [id]);
    await pool.query("DELETE FROM facialtcc.professores WHERE id = ?", [id]);

    res.json({ success: true, message: `Professor "${existe[0].nome}" removido com sucesso.` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro ao remover professor." });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
