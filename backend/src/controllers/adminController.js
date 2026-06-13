const pool = require('../config/db');

// ===== FILMES =====
const listarFilmesAdmin = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT f.*, c.nome as categoria_nome FROM filmes f
     LEFT JOIN categorias c ON f.categoria_id = c.id
     ORDER BY f.criado_em DESC`
  );
  res.json(rows);
};

const criarFilme = async (req, res) => {
  const { titulo, descricao, capa_url, tipo, gratuito, valor, url_video, destaque, lancamento, ano, duracao, classificacao, categoria_id } = req.body;
  if (!titulo) return res.status(400).json({ error: 'Título é obrigatório' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO filmes (titulo, descricao, capa_url, tipo, gratuito, valor, url_video, destaque, lancamento, ano, duracao, classificacao, categoria_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [titulo, descricao, capa_url, tipo || 'filme', gratuito ?? true, valor || 0, url_video, destaque ?? false, lancamento ?? false, ano, duracao, classificacao, categoria_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar filme' });
  }
};

const atualizarFilme = async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, capa_url, tipo, gratuito, valor, url_video, destaque, lancamento, ano, duracao, classificacao, categoria_id, ativo } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE filmes SET titulo=$1, descricao=$2, capa_url=$3, tipo=$4, gratuito=$5, valor=$6,
       url_video=$7, destaque=$8, lancamento=$9, ano=$10, duracao=$11, classificacao=$12,
       categoria_id=$13, ativo=$14 WHERE id=$15 RETURNING *`,
      [titulo, descricao, capa_url, tipo, gratuito, valor, url_video, destaque, lancamento, ano, duracao, classificacao, categoria_id, ativo ?? true, id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Filme não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar filme' });
  }
};

const excluirFilme = async (req, res) => {
  const { id } = req.params;
  await pool.query('UPDATE filmes SET ativo = false WHERE id = $1', [id]);
  res.json({ message: 'Filme removido' });
};

// ===== USUÁRIOS =====
const listarUsuarios = async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, nome, email, role, ativo, data_cadastro FROM usuarios ORDER BY data_cadastro DESC'
  );
  res.json(rows);
};

// ===== PAGAMENTOS =====
const listarPagamentos = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT c.*, u.nome as usuario_nome, u.email as usuario_email, f.titulo as filme_titulo
     FROM compras c
     JOIN usuarios u ON c.usuario_id = u.id
     JOIN filmes f ON c.filme_id = f.id
     ORDER BY c.criado_em DESC`
  );
  res.json(rows);
};

// ===== DASHBOARD =====
const dashboard = async (req, res) => {
  const [usuarios, filmes, pagamentos, receita] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM usuarios WHERE role = $1', ['user']),
    pool.query('SELECT COUNT(*) FROM filmes WHERE ativo = true'),
    pool.query(`SELECT COUNT(*) FROM compras WHERE status_pagamento = 'aprovado'`),
    pool.query(`SELECT COALESCE(SUM(valor_pago),0) as total FROM compras WHERE status_pagamento = 'aprovado'`),
  ]);

  res.json({
    totalUsuarios: parseInt(usuarios.rows[0].count),
    totalFilmes: parseInt(filmes.rows[0].count),
    totalPagamentos: parseInt(pagamentos.rows[0].count),
    receitaTotal: parseFloat(receita.rows[0].total),
  });
};

module.exports = { listarFilmesAdmin, criarFilme, atualizarFilme, excluirFilme, listarUsuarios, listarPagamentos, dashboard };
