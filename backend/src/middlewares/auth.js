const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const autenticar = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT id, nome, email, role FROM usuarios WHERE id = $1 AND ativo = true',
      [decoded.id]
    );
    if (!rows[0]) return res.status(401).json({ error: 'Usuário não encontrado' });
    req.usuario = rows[0];
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.usuario?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito ao administrador' });
  }
  next();
};

module.exports = { autenticar, isAdmin };
