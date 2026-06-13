const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const pixService = require('../services/pixService');

const iniciarPagamento = async (req, res) => {
  const { filmeId } = req.body;
  const usuarioId = req.usuario.id;

  try {
    const { rows: [filme] } = await pool.query(
      'SELECT id, titulo, valor, gratuito FROM filmes WHERE id = $1 AND ativo = true',
      [filmeId]
    );
    if (!filme) return res.status(404).json({ error: 'Filme não encontrado' });
    if (filme.gratuito) return res.status(400).json({ error: 'Este conteúdo é gratuito' });

    // Verificar se já comprou
    const { rows: [compraExistente] } = await pool.query(
      `SELECT id FROM compras WHERE usuario_id = $1 AND filme_id = $2 AND status_pagamento = 'aprovado'`,
      [usuarioId, filmeId]
    );
    if (compraExistente) return res.status(400).json({ error: 'Você já possui acesso a este conteúdo' });

    // Verificar pagamento pendente recente
    const { rows: [pendente] } = await pool.query(
      `SELECT id, pix_copia_cola, qr_code_base64, data_expiracao, txid, valor_pago
       FROM compras
       WHERE usuario_id = $1 AND filme_id = $2 AND status_pagamento = 'pendente' AND data_expiracao > NOW()`,
      [usuarioId, filmeId]
    );
    if (pendente) return res.json(pendente);

    const txid = uuidv4().replace(/-/g, '').substring(0, 25);
    const pix = await pixService.gerarPix({
      valor: filme.valor,
      txid,
      descricao: `StreamFlix - ${filme.titulo}`,
    });

    const { rows: [compra] } = await pool.query(
      `INSERT INTO compras (usuario_id, filme_id, valor_pago, txid, pix_copia_cola, qr_code_base64, data_expiracao)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, pix_copia_cola, qr_code_base64, data_expiracao, txid, valor_pago`,
      [usuarioId, filmeId, filme.valor, txid, pix.pixCopiaECola, pix.qrCodeBase64, pix.expiracao]
    );

    res.json(compra);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar pagamento' });
  }
};

const verificarPagamento = async (req, res) => {
  const { txid } = req.params;
  const usuarioId = req.usuario.id;

  try {
    const { rows: [compra] } = await pool.query(
      `SELECT id, status_pagamento, filme_id FROM compras WHERE txid = $1 AND usuario_id = $2`,
      [txid, usuarioId]
    );
    if (!compra) return res.status(404).json({ error: 'Pagamento não encontrado' });

    res.json({ status: compra.status_pagamento, filmeId: compra.filme_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao verificar pagamento' });
  }
};

// Webhook para receber confirmação de pagamento do PSP
const webhookPagamento = async (req, res) => {
  const { txid, status } = req.body;
  // Validar assinatura do webhook aqui em produção
  try {
    if (status === 'CONCLUIDA' || status === 'aprovado') {
      await pool.query(
        `UPDATE compras SET status_pagamento = 'aprovado', data_pagamento = NOW()
         WHERE txid = $1 AND status_pagamento = 'pendente'`,
        [txid]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no webhook' });
  }
};

// Aprovar manualmente (admin)
const aprovarManual = async (req, res) => {
  const { compraId } = req.params;
  try {
    await pool.query(
      `UPDATE compras SET status_pagamento = 'aprovado', data_pagamento = NOW() WHERE id = $1`,
      [compraId]
    );
    res.json({ message: 'Pagamento aprovado' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao aprovar pagamento' });
  }
};

const minhasCompras = async (req, res) => {
  const usuarioId = req.usuario.id;
  const { rows } = await pool.query(
    `SELECT c.*, f.titulo, f.capa_url FROM compras c
     JOIN filmes f ON c.filme_id = f.id
     WHERE c.usuario_id = $1 AND c.status_pagamento = 'aprovado'
     ORDER BY c.data_pagamento DESC`,
    [usuarioId]
  );
  res.json(rows);
};

module.exports = { iniciarPagamento, verificarPagamento, webhookPagamento, aprovarManual, minhasCompras };
