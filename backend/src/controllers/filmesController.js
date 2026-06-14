const pool = require('../config/db');

const listarFilmes = async (req, res) => {
  const { tipo, gratuito, destaque, lancamento, categoria, busca, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT f.*, c.nome as categoria_nome
    FROM filmes f
    LEFT JOIN categorias c ON f.categoria_id = c.id
    WHERE f.ativo = true
  `;
  const params = [];
  let idx = 1;

  if (tipo) { query += ` AND f.tipo = $${idx++}`; params.push(tipo); }
  if (gratuito !== undefined) { query += ` AND f.gratuito = $${idx++}`; params.push(gratuito === 'true'); }
  if (destaque === 'true') { query += ` AND f.destaque = true`; }
  if (lancamento === 'true') { query += ` AND f.lancamento = true`; }
  if (categoria) { query += ` AND c.slug = $${idx++}`; params.push(categoria); }
  if (busca) { query += ` AND f.titulo ILIKE $${idx++}`; params.push(`%${busca}%`); }

  const countResult = await pool.query(query.replace('f.*, c.nome as categoria_nome', 'COUNT(*)'), params);
  const total = parseInt(countResult.rows[0].count);

  query += ` ORDER BY f.criado_em DESC LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(parseInt(limit), offset);

  const { rows } = await pool.query(query, params);
  res.json({ filmes: rows, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
};

const buscarFilme = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    `SELECT f.*, c.nome as categoria_nome
     FROM filmes f
     LEFT JOIN categorias c ON f.categoria_id = c.id
     WHERE f.id = $1 AND f.ativo = true`,
    [id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Filme não encontrado' });

  const { rows: episodios } = await pool.query(
    `SELECT id, titulo, numero, url_video, duracao
     FROM episodios WHERE filme_id = $1 ORDER BY numero ASC`,
    [id]
  );

  res.json({ ...rows[0], episodios });
};

const verificarAcesso = async (req, res) => {
  const { id } = req.params;
  const usuarioId = req.usuario?.id;

  const { rows: [filme] } = await pool.query('SELECT id, gratuito FROM filmes WHERE id = $1', [id]);
  if (!filme) return res.status(404).json({ error: 'Filme não encontrado' });

  if (filme.gratuito) return res.json({ acesso: true, motivo: 'gratuito' });
  if (!usuarioId) return res.json({ acesso: false, motivo: 'login_necessario' });

  // Verificar assinatura ativa
  const { rows: [assinatura] } = await pool.query(
    `SELECT id FROM assinaturas WHERE usuario_id = $1 AND status = 'ativa' AND data_fim > NOW()`,
    [usuarioId]
  );
  if (assinatura) return res.json({ acesso: true, motivo: 'assinante' });

  return res.json({ acesso: false, motivo: 'assinatura_necessaria' });
};

const listarCategorias = async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM categorias ORDER BY nome');
  res.json(rows);
};

module.exports = { listarFilmes, buscarFilme, verificarAcesso, listarCategorias };
