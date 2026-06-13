const router = require('express').Router();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { autenticar } = require('../middlewares/auth');

router.get('/perfil', autenticar, async (req, res) => {
  res.json(req.usuario);
});

router.put('/perfil', autenticar, async (req, res) => {
  const { nome, senhaAtual, novaSenha } = req.body;
  const id = req.usuario.id;

  try {
    if (novaSenha) {
      const { rows: [u] } = await pool.query('SELECT senha FROM usuarios WHERE id = $1', [id]);
      const valida = await bcrypt.compare(senhaAtual, u.senha);
      if (!valida) return res.status(400).json({ error: 'Senha atual incorreta' });
      const hash = await bcrypt.hash(novaSenha, 10);
      await pool.query('UPDATE usuarios SET nome=$1, senha=$2 WHERE id=$3', [nome, hash, id]);
    } else {
      await pool.query('UPDATE usuarios SET nome=$1 WHERE id=$2', [nome, id]);
    }
    res.json({ message: 'Perfil atualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

module.exports = router;
