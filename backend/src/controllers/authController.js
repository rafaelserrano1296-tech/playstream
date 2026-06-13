const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const emailService = require('../services/emailService');

const gerarToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const cadastrar = async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ error: 'Preencha todos os campos' });

  if (senha.length < 6)
    return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email.toLowerCase()]);
    if (existe.rows[0]) return res.status(409).json({ error: 'E-mail já cadastrado' });

    const hash = await bcrypt.hash(senha, 10);
    const { rows } = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email, role',
      [nome.trim(), email.toLowerCase(), hash]
    );

    const token = gerarToken(rows[0].id);
    res.status(201).json({ token, usuario: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
};

const login = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });

  try {
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND ativo = true',
      [email.toLowerCase()]
    );
    if (!rows[0]) return res.status(401).json({ error: 'Credenciais inválidas' });

    const senhaValida = await bcrypt.compare(senha, rows[0].senha);
    if (!senhaValida) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = gerarToken(rows[0].id);
    const { senha: _, ...usuario } = rows[0];
    res.json({ token, usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

const solicitarResetSenha = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-mail é obrigatório' });

  try {
    const { rows } = await pool.query('SELECT id, nome FROM usuarios WHERE email = $1', [email.toLowerCase()]);
    // Não revela se o email existe ou não por segurança
    if (!rows[0]) return res.json({ message: 'Se o e-mail existir, enviaremos as instruções' });

    const token = uuidv4();
    const expiry = new Date(Date.now() + 3600000); // 1 hora

    await pool.query(
      'UPDATE usuarios SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [token, expiry, rows[0].id]
    );

    await emailService.enviarResetSenha(email, rows[0].nome, token);
    res.json({ message: 'Se o e-mail existir, enviaremos as instruções' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
};

const resetarSenha = async (req, res) => {
  const { token, novaSenha } = req.body;
  if (!token || !novaSenha)
    return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });

  if (novaSenha.length < 6)
    return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });

  try {
    const { rows } = await pool.query(
      'SELECT id FROM usuarios WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    );
    if (!rows[0]) return res.status(400).json({ error: 'Token inválido ou expirado' });

    const hash = await bcrypt.hash(novaSenha, 10);
    await pool.query(
      'UPDATE usuarios SET senha = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hash, rows[0].id]
    );

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao resetar senha' });
  }
};

const perfil = async (req, res) => {
  res.json({ usuario: req.usuario });
};

module.exports = { cadastrar, login, solicitarResetSenha, resetarSenha, perfil };
