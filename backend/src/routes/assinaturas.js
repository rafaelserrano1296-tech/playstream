const router = require('express').Router();
const { autenticar } = require('../middlewares/auth');
const pool = require('../config/db');
const axios = require('axios');

const ABACATEPAY_URL = 'https://api.abacatepay.com/v2';
const ABACATEPAY_KEY = process.env.ABACATEPAY_KEY;

// Criar link de pagamento AbacatePay
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

    // Criar link de pagamento no AbacatePay
    const response = await axios.post(
      `${ABACATEPAY_URL}/billing/create`,
      {
        frequency: 'ONE_TIME',
        methods: ['PIX'],
        products: [{
          externalId: String(usuarioId),
          name: 'Assinatura Play Stream Premium',
          description: 'Acesso completo ao catálogo de doramas por 30 dias',
          quantity: 1,
          price: 990,
        }],
        returnUrl: `${process.env.FRONTEND_URL}/assinar`,
        completionUrl: `${process.env.FRONTEND_URL}/assinar?pago=1`,
        customer: {
          name: usuario.nome,
          email: usuario.email,
          cellphone: '11999999999',
          taxId: '00000000000',
        },
        metadata: {
          usuario_id: String(usuarioId),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${ABACATEPAY_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const billing = response.data.data || response.data;
    const txid = billing.id || billing._id;
    const url = billing.url || billing.checkoutUrl || '';

    // Salvar no banco
    await pool.query(
      `INSERT INTO assinaturas (usuario_id, txid, pix_copia_cola, status, valor)
       VALUES ($1, $2, $3, 'pendente', 9.90)`,
      [usuarioId, txid, url]
    );

    res.json({
      txid,
      url,
      valor: 9.90,
    });
  } catch (err) {
    console.error('Erro AbacatePay:', err.response?.data || err.message);
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

// Webhook AbacatePay — chamado automaticamente quando pagar
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    console.log('Webhook AbacatePay:', JSON.stringify(event));

    if (event.event === 'billing.paid' || event.event === 'transparent.completed' || event.status === 'PAID') {
      const txid = event.data?.id || event.data?.billing?.id || event.id;
      const usuarioId = event.data?.metadata?.usuario_id || event.data?.billing?.metadata?.usuario_id || event.metadata?.usuario_id;

      if (!txid) return res.json({ ok: true });

      // Ativar assinatura por 30 dias
      const dataInicio = new Date();
      const dataFim = new Date();
      dataFim.setDate(dataFim.getDate() + 30);

      await pool.query(
        `UPDATE assinaturas SET status = 'ativa', data_inicio = $1, data_fim = $2 WHERE txid = $3`,
        [dataInicio, dataFim, txid]
      );

      console.log(`Assinatura ativada para usuario ${usuarioId} até ${dataFim}`);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Erro webhook:', err.message);
    res.status(500).json({ error: 'Erro no webhook' });
  }
});

module.exports = router;
