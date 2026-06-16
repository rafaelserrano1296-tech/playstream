const router = require('express').Router();
const { autenticar } = require('../middlewares/auth');
const pool = require('../config/db');
const axios = require('axios');

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

const PLANOS = {
  semanal: { valor: 7.99, dias: 7, descricao: 'Assinatura Play Stream - 7 dias' },
  mensal:  { valor: 14.99, dias: 30, descricao: 'Assinatura Play Stream Premium - 30 dias' },
};

router.post('/iniciar', autenticar, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const usuario = req.usuario;
    const plano = PLANOS[req.body.plano] ? req.body.plano : 'mensal';
    const { valor, dias, descricao } = PLANOS[plano];

    const { rows: ativas } = await pool.query(
      `SELECT * FROM assinaturas WHERE usuario_id = $1 AND status = 'ativa' AND data_fim > NOW()`,
      [usuarioId]
    );
    if (ativas.length > 0) {
      return res.json({ assinatura_ativa: true, data_fim: ativas[0].data_fim });
    }

    const response = await axios.post(
      'https://api.mercadopago.com/v1/payments',
      {
        transaction_amount: valor,
        description: descricao,
        payment_method_id: 'pix',
        payer: {
          email: usuario.email,
          first_name: usuario.nome.split(' ')[0],
          last_name: usuario.nome.split(' ').slice(1).join(' ') || usuario.nome.split(' ')[0],
        },
        metadata: {
          usuario_id: String(usuarioId),
          plano,
          dias: String(dias),
        },
        notification_url: `${process.env.BACKEND_URL}/api/assinaturas/webhook`,
      },
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': `${usuarioId}-${plano}-${Date.now()}`,
        },
      }
    );

    const payment = response.data;
    const txid = String(payment.id);
    const pixCopiaECola = payment.point_of_interaction?.transaction_data?.qr_code || '';
    const qrCodeBase64 = payment.point_of_interaction?.transaction_data?.qr_code_base64 || '';

    await pool.query(
      `INSERT INTO assinaturas (usuario_id, txid, pix_copia_cola, status, valor)
       VALUES ($1, $2, $3, 'pendente', $4)`,
      [usuarioId, txid, pixCopiaECola, valor]
    );

    res.json({ txid, pix_copia_cola: pixCopiaECola, qr_code_base64: qrCodeBase64, valor, plano, dias });
  } catch (err) {
    console.error('Erro MP PIX:', err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao gerar PIX' });
  }
});

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

router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;
    console.log('Webhook MP:', JSON.stringify(req.body));

    if (type === 'payment' && data?.id) {
      const pagamento = await axios.get(
        `https://api.mercadopago.com/v1/payments/${data.id}`,
        { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } }
      );

      const p = pagamento.data;
      console.log('Pagamento MP status:', p.status, 'usuario_id:', p.metadata?.usuario_id);

      if (p.status === 'approved') {
        const usuarioId = p.metadata?.usuario_id;
        const txid = String(p.id);
        const dias = parseInt(p.metadata?.dias || '30', 10);

        const dataInicio = new Date();
        const dataFim = new Date();
        dataFim.setDate(dataFim.getDate() + dias);

        if (usuarioId) {
          await pool.query(
            `UPDATE assinaturas SET status = 'ativa', data_inicio = $1, data_fim = $2
             WHERE usuario_id = $3 AND status = 'pendente'`,
            [dataInicio, dataFim, usuarioId]
          );
        } else {
          await pool.query(
            `UPDATE assinaturas SET status = 'ativa', data_inicio = $1, data_fim = $2 WHERE txid = $3`,
            [dataInicio, dataFim, txid]
          );
        }

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
