// src/controllers/registrosController.js
const { pool } = require("../config/database");

// GET /api/registros — Histórico com filtros e paginação
async function listar(req, res) {
  try {
    const {
      busca,
      tipo_identificacao, // 'rfid' ou 'facial'
      tipo_acesso,        // 'entrada' ou 'saida'
      data_inicio,
      data_fim,
      turma_id,
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = `
      SELECT 
        ra.id,
        ra.tipo_identificacao,
        ra.data_hora,
        ra.tipo_acesso,
        ra.alunos_id,
        ra.professores_id,
        -- Dados do aluno (se for aluno)
        a.nome       AS aluno_nome,
        a.matricula  AS aluno_matricula,
        a.foto       AS aluno_foto,
        t.nome       AS turma_nome,
        -- Dados do professor (se for professor)
        p.nome       AS professor_nome,
        p.foto       AS professor_foto
      FROM facialtcc.registros_acessos ra
      LEFT JOIN facialtcc.alunos a ON ra.alunos_id = a.id
      LEFT JOIN facialtcc.turmas t ON a.turmas_id = t.id
      LEFT JOIN facialtcc.professores p ON ra.professores_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (busca) {
      sql += ` AND (a.nome LIKE ? OR p.nome LIKE ? OR a.matricula LIKE ?)`;
      params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
    }

    if (tipo_identificacao) {
      sql += ` AND ra.tipo_identificacao = ?`;
      params.push(tipo_identificacao);
    }

    if (tipo_acesso) {
      sql += ` AND ra.tipo_acesso = ?`;
      params.push(tipo_acesso);
    }

    if (data_inicio) {
      sql += ` AND DATE(ra.data_hora) >= ?`;
      params.push(data_inicio);
    }

    if (data_fim) {
      sql += ` AND DATE(ra.data_hora) <= ?`;
      params.push(data_fim);
    }

    if (turma_id) {
      sql += ` AND a.turmas_id = ?`;
      params.push(turma_id);
    }

    // Conta o total para paginação
    const countSql = `SELECT COUNT(*) AS total FROM (${sql}) AS sub`;
    const [countResult] = await pool.query(countSql, params);
    const total = countResult[0].total;

    // Aplica ordenação e paginação
    sql += ` ORDER BY ra.data_hora DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [registros] = await pool.query(sql, params);

    res.json({
      success: true,
      total,
      pagina: parseInt(page),
      total_paginas: Math.ceil(total / parseInt(limit)),
      data: registros,
    });
  } catch (err) {
    console.error("Erro ao listar registros:", err);
    res.status(500).json({ success: false, message: "Erro ao buscar registros." });
  }
}

// GET /api/registros/hoje — Entradas de hoje (para o dashboard)
async function hoje(req, res) {
  try {
    const [registros] = await pool.query(`
      SELECT 
        ra.*,
        a.nome AS aluno_nome, a.matricula, a.foto AS aluno_foto,
        t.nome AS turma_nome,
        p.nome AS professor_nome
      FROM facialtcc.registros_acessos ra
      LEFT JOIN facialtcc.alunos a ON ra.alunos_id = a.id
      LEFT JOIN facialtcc.turmas t ON a.turmas_id = t.id
      LEFT JOIN facialtcc.professores p ON ra.professores_id = p.id
      WHERE DATE(ra.data_hora) = CURDATE()
      ORDER BY ra.data_hora DESC
      LIMIT 50
    `);

    // Estatísticas do dia
    const [stats] = await pool.query(`
      SELECT
        COUNT(*) AS total_entradas,
        SUM(CASE WHEN ra.tipo_identificacao = 'rfid' THEN 1 ELSE 0 END) AS via_rfid,
        SUM(CASE WHEN ra.tipo_identificacao = 'facial' THEN 1 ELSE 0 END) AS via_facial,
        COUNT(DISTINCT ra.alunos_id) AS alunos_presentes
      FROM facialtcc.registros_acessos ra
      WHERE DATE(ra.data_hora) = CURDATE()
        AND ra.tipo_acesso = 'entrada'
    `);

    res.json({
      success: true,
      data: registros,
      stats: stats[0],
    });
  } catch (err) {
    console.error("Erro ao buscar registros de hoje:", err);
    res.status(500).json({ success: false, message: "Erro ao buscar registros de hoje." });
  }
}

// POST /api/registros — Registra um novo acesso (chamado pelo leitor RFID ou câmera)
async function registrar(req, res) {
  try {
    const { tipo_identificacao, tipo_acesso, alunos_id, professores_id, identificador } = req.body;

    if (!tipo_identificacao || !tipo_acesso) {
      return res.status(400).json({
        success: false,
        message: "tipo_identificacao e tipo_acesso são obrigatórios.",
      });
    }

    if (!alunos_id && !professores_id && !identificador) {
      return res.status(400).json({
        success: false,
        message: "Informe alunos_id, professores_id ou um identificador (rfid/nome facial).",
      });
    }

    let alunoId = alunos_id || null;
    let professorId = professores_id || null;

    // Se veio um identificador RFID, tenta encontrar o dono
    if (identificador && tipo_identificacao === "rfid") {
      const [aluno] = await pool.query(
        "SELECT id FROM facialtcc.alunos WHERE rfid = ?", [identificador]
      );
      if (aluno.length > 0) {
        alunoId = aluno[0].id;
      } else {
        const [prof] = await pool.query(
          "SELECT id FROM facialtcc.professores WHERE rfid = ?", [identificador]
        );
        if (prof.length > 0) {
          professorId = prof[0].id;
        } else {
          return res.status(404).json({
            success: false,
            message: "Nenhum aluno ou professor encontrado com este RFID.",
            rfid: identificador,
          });
        }
      }
    }

    // Insere o registro
    const [result] = await pool.query(
      `INSERT INTO facialtcc.registros_acessos 
       (tipo_identificacao, data_hora, tipo_acesso, alunos_id, professores_id)
       VALUES (?, NOW(), ?, ?, ?)`,
      [tipo_identificacao, tipo_acesso, alunoId, professorId]
    );

    // Busca os dados completos do registro recém-criado para retornar
    const [novoRegistro] = await pool.query(`
      SELECT ra.*, 
        a.nome AS aluno_nome, a.foto AS aluno_foto, t.nome AS turma_nome,
        p.nome AS professor_nome
      FROM facialtcc.registros_acessos ra
      LEFT JOIN facialtcc.alunos a ON ra.alunos_id = a.id
      LEFT JOIN facialtcc.turmas t ON a.turmas_id = t.id
      LEFT JOIN facialtcc.professores p ON ra.professores_id = p.id
      WHERE ra.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Acesso registrado com sucesso!",
      data: novoRegistro[0],
    });
  } catch (err) {
    console.error("Erro ao registrar acesso:", err);
    res.status(500).json({ success: false, message: "Erro ao registrar acesso." });
  }
}

// POST /api/registros/rfid — Endpoint específico para leitores RFID físicos
async function registrarRfid(req, res) {
  try {
    const { rfid, tipo_acesso = "entrada" } = req.body;

    if (!rfid) {
      return res.status(400).json({ success: false, message: "Código RFID é obrigatório." });
    }

    // Busca o dono do RFID
    const [aluno] = await pool.query(
      "SELECT id, nome, foto, turmas_id FROM facialtcc.alunos WHERE rfid = ?", [rfid]
    );

    if (aluno.length > 0) {
      // É um aluno
      await pool.query(
        `INSERT INTO facialtcc.registros_acessos (tipo_identificacao, data_hora, tipo_acesso, alunos_id)
         VALUES ('rfid', NOW(), ?, ?)`,
        [tipo_acesso, aluno[0].id]
      );

      return res.json({
        success: true,
        autorizado: true,
        tipo: "aluno",
        pessoa: { nome: aluno[0].nome, foto: aluno[0].foto },
        mensagem: `Bem-vindo(a), ${aluno[0].nome}!`,
      });
    }

    const [professor] = await pool.query(
      "SELECT id, nome, foto FROM facialtcc.professores WHERE rfid = ?", [rfid]
    );

    if (professor.length > 0) {
      // É um professor
      await pool.query(
        `INSERT INTO facialtcc.registros_acessos (tipo_identificacao, data_hora, tipo_acesso, professores_id)
         VALUES ('rfid', NOW(), ?, ?)`,
        [tipo_acesso, professor[0].id]
      );

      return res.json({
        success: true,
        autorizado: true,
        tipo: "professor",
        pessoa: { nome: professor[0].nome, foto: professor[0].foto },
        mensagem: `Bem-vindo(a), Prof. ${professor[0].nome}!`,
      });
    }

    // RFID não cadastrado
    return res.status(404).json({
      success: false,
      autorizado: false,
      mensagem: "Cartão não reconhecido. Acesso negado.",
    });
  } catch (err) {
    console.error("Erro no registro RFID:", err);
    res.status(500).json({ success: false, message: "Erro ao processar leitura RFID." });
  }
}

// POST /api/registros/facial — Endpoint específico para câmera de reconhecimento facial
async function registrarFacial(req, res) {
  try {
    const { nome_detectado, confianca, tipo_acesso = "entrada" } = req.body;

    if (!nome_detectado) {
      return res.status(400).json({ success: false, message: "Nome detectado é obrigatório." });
    }

    // Busca aluno pelo nome (nome exato ou parcial)
    const [aluno] = await pool.query(
      "SELECT id, nome, foto FROM facialtcc.alunos WHERE nome LIKE ?",
      [`%${nome_detectado}%`]
    );

    if (aluno.length > 0) {
      await pool.query(
        `INSERT INTO facialtcc.registros_acessos (tipo_identificacao, data_hora, tipo_acesso, alunos_id)
         VALUES ('facial', NOW(), ?, ?)`,
        [tipo_acesso, aluno[0].id]
      );

      return res.json({
        success: true,
        autorizado: true,
        tipo: "aluno",
        pessoa: { id: aluno[0].id, nome: aluno[0].nome, foto: aluno[0].foto },
        confianca,
        mensagem: `Acesso liberado! Bem-vindo(a), ${aluno[0].nome}!`,
      });
    }

    // Tenta professor
    const [professor] = await pool.query(
      "SELECT id, nome, foto FROM facialtcc.professores WHERE nome LIKE ?",
      [`%${nome_detectado}%`]
    );

    if (professor.length > 0) {
      await pool.query(
        `INSERT INTO facialtcc.registros_acessos (tipo_identificacao, data_hora, tipo_acesso, professores_id)
         VALUES ('facial', NOW(), ?, ?)`,
        [tipo_acesso, professor[0].id]
      );

      return res.json({
        success: true,
        autorizado: true,
        tipo: "professor",
        pessoa: { id: professor[0].id, nome: professor[0].nome },
        confianca,
        mensagem: `Acesso liberado! Bem-vindo(a), Prof. ${professor[0].nome}!`,
      });
    }

    return res.status(404).json({
      success: false,
      autorizado: false,
      mensagem: "Rosto não reconhecido. Acesso negado.",
    });
  } catch (err) {
    console.error("Erro no registro facial:", err);
    res.status(500).json({ success: false, message: "Erro ao processar reconhecimento facial." });
  }
}

// GET /api/registros/stats — Estatísticas para os gráficos do dashboard
async function stats(req, res) {
  try {
    // Entradas por dia da semana (últimos 7 dias)
    const [porDia] = await pool.query(`
      SELECT 
        DATE(data_hora) AS data,
        DAYNAME(data_hora) AS dia_semana,
        COUNT(*) AS total
      FROM facialtcc.registros_acessos
      WHERE data_hora >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND tipo_acesso = 'entrada'
      GROUP BY DATE(data_hora)
      ORDER BY data ASC
    `);

    // Total de alunos vs presentes hoje
    const [[totalAlunos]] = await pool.query(
      "SELECT COUNT(*) AS total FROM facialtcc.alunos"
    );

    const [[presentesHoje]] = await pool.query(`
      SELECT COUNT(DISTINCT alunos_id) AS total
      FROM facialtcc.registros_acessos
      WHERE DATE(data_hora) = CURDATE()
        AND tipo_acesso = 'entrada'
        AND alunos_id IS NOT NULL
    `);

    // Por método de identificação (geral)
    const [porMetodo] = await pool.query(`
      SELECT tipo_identificacao, COUNT(*) AS total
      FROM facialtcc.registros_acessos
      GROUP BY tipo_identificacao
    `);

    // Presença por turma hoje
    const [porTurma] = await pool.query(`
      SELECT 
        t.nome AS turma,
        COUNT(DISTINCT ra.alunos_id) AS presentes,
        COUNT(DISTINCT a2.id) AS total_turma
      FROM facialtcc.turmas t
      LEFT JOIN facialtcc.alunos a2 ON a2.turmas_id = t.id
      LEFT JOIN facialtcc.registros_acessos ra 
        ON ra.alunos_id = a2.id 
        AND DATE(ra.data_hora) = CURDATE()
        AND ra.tipo_acesso = 'entrada'
      GROUP BY t.id, t.nome
      ORDER BY t.nome
    `);

    res.json({
      success: true,
      data: {
        entradas_por_dia: porDia,
        total_alunos: totalAlunos.total,
        presentes_hoje: presentesHoje.total,
        taxa_presenca: totalAlunos.total > 0
          ? Math.round((presentesHoje.total / totalAlunos.total) * 100)
          : 0,
        por_metodo: porMetodo,
        por_turma: porTurma,
      },
    });
  } catch (err) {
    console.error("Erro ao buscar estatísticas:", err);
    res.status(500).json({ success: false, message: "Erro ao buscar estatísticas." });
  }
}

module.exports = { listar, hoje, registrar, registrarRfid, registrarFacial, stats };
