const router = require('express').Router();
const { autenticar } = require('../middlewares/auth');
const pool = require('../config/db');
const axios = require('axios');

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

// Criar preferência de pagamento Mercado Pago
router.post('/iniciar', autenticar, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const usuario = req.usuario;

    // Verificar se já tem assinatura ativa
    const { rows: ativas } = await pool.query(
      `SELECT * FROM assinaturas WHERE usuario_id = $1 AND status = 'ativa' AND data_fim > NOW()`,
      [usuarioId]
    );
    if (ativas.length > 0) {
      return res.json({ assinatura_ativa: true, data_fim: ativas[0].data_fim });
    }

    // Criar preferência no Mercado Pago
    const response = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      {
        items: [{
          title: 'Assinatura Play Stream Premium',
          description: 'Acesso completo ao catálogo de doramas por 30 dias',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: 9.90,
        }],
        payer: {
          name: usuario.nome,
          email: usuario.email,
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/assinar?pago=1`,
          failure: `${process.env.FRONTEND_URL}/assinar?erro=1`,
          pending: `${process.env.FRONTEND_URL}/assinar?pago=1`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.BACKEND_URL}/api/assinaturas/webhook`,
        metadata: {
          usuario_id: String(usuarioId),
        },
        payment_methods: {
          excluded_payment_types: [],
          installments: 1,
        },
        statement_descriptor: 'PLAY STREAM',
      },
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const preference = response.data;
    const txid = preference.id;
    const url = preference.init_point;

    // Salvar no banco
    await pool.query(
      `INSERT INTO assinaturas (usuario_id, txid, pix_copia_cola, status, valor)
       VALUES ($1, $2, $3, 'pendente', 9.90)`,
      [usuarioId, txid, url]
    );

    res.json({ txid, url, valor: 9.90 });
  } catch (err) {
    console.error('Erro Mercado Pago:', err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao gerar link de pagamento' });
  }
});

// Verificar status da assinatura do usuário
router.get('/status', autenticar, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM assinaturas WHERE usuario_id = $1 AND status = 'ativa' AND data_fim > NOW() ORDER BY data_fim DESC LIMIT 1`,
      [req.usuario.id]
    );
    if (rows.length > 0) {
      return res.json({ ativa: true, data_fim: rows[0].data_fim });
    }
    res.json({ ativa: false });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao verificar assinatura' });
  }
});

// Webhook Mercado Pago — chamado automaticamente quando pagar
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;
    console.log('Webhook MP:', JSON.stringify(req.body));

    if (type === 'payment' && data?.id) {
      // Buscar detalhes do pagamento
      const pagamento = await axios.get(
        `https://api.mercadopago.com/v1/payments/${data.id}`,
        { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } }
      );

      const p = pagamento.data;
      console.log('Pagamento MP:', p.status, p.metadata);

      if (p.status === 'approved') {
        const usuarioId = p.metadata?.usuario_id;
        const txid = p.preference_id;

        if (!txid) return res.json({ ok: true });

        const dataInicio = new Date();
        const dataFim = new Date();
        dataFim.setDate(dataFim.getDate() + 30);

        await pool.query(
          `UPDATE assinaturas SET status = 'ativa', data_inicio = $1, data_fim = $2 WHERE txid = $3`,
          [dataInicio, dataFim, txid]
        );

        console.log(`Assinatura ativada para usuario ${usuarioId} até ${dataFim}`);
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Erro webhook MP:', err.message);
    res.status(500).json({ error: 'Erro no webhook' });
  }
});

module.exports = router;
