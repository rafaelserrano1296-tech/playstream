const router = require('express').Router();
const { iniciarPagamento, verificarPagamento, webhookPagamento, minhasCompras } = require('../controllers/pagamentosController');
const { autenticar } = require('../middlewares/auth');

router.post('/iniciar', autenticar, iniciarPagamento);
router.get('/verificar/:txid', autenticar, verificarPagamento);
router.get('/minhas-compras', autenticar, minhasCompras);
router.post('/webhook', webhookPagamento);

module.exports = router;
