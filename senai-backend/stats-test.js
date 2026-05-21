const { pool } = require('./src/config/database');

(async () => {
  try {
    const [rows] = await pool.query(`SELECT DATE(data_hora) AS data, DAYOFWEEK(data_hora) AS dia_semana_num, COUNT(*) AS total FROM facialtcc.registros_acessos WHERE data_hora >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND tipo_acesso = 'entrada' GROUP BY DATE(data_hora), DAYOFWEEK(data_hora) ORDER BY data ASC`);
    console.log('porDia:', rows);

    const [[totalAlunos]] = await pool.query('SELECT COUNT(*) AS total FROM facialtcc.alunos');
    console.log('totalAlunos:', totalAlunos);

    const [[presentesHoje]] = await pool.query(`SELECT COUNT(DISTINCT alunos_id) AS total FROM facialtcc.registros_acessos WHERE DATE(data_hora) = CURDATE() AND tipo_acesso = 'entrada' AND alunos_id IS NOT NULL`);
    console.log('presentesHoje:', presentesHoje);

    const [porMetodo] = await pool.query(`SELECT tipo_identificacao, COUNT(*) AS total FROM facialtcc.registros_acessos GROUP BY tipo_identificacao`);
    console.log('porMetodo:', porMetodo);

    const [porTurma] = await pool.query(`SELECT t.nome AS turma, COUNT(DISTINCT ra.alunos_id) AS presentes, COUNT(DISTINCT a2.id) AS total_turma FROM facialtcc.turmas t LEFT JOIN facialtcc.alunos a2 ON a2.turmas_id = t.id LEFT JOIN facialtcc.registros_acessos ra ON ra.alunos_id = a2.id AND DATE(ra.data_hora) = CURDATE() AND ra.tipo_acesso = 'entrada' GROUP BY t.id, t.nome ORDER BY t.nome`);
    console.log('porTurma:', porTurma);
  } catch (error) {
    console.error('ERROR', error);
  } finally {
    process.exit(0);
  }
})();