const router = require('express').Router();
const { listarFilmesAdmin, criarFilme, atualizarFilme, excluirFilme, listarUsuarios, listarPagamentos, dashboard } = require('../controllers/adminController');
const { aprovarManual } = require('../controllers/pagamentosController');
const { autenticar, isAdmin } = require('../middlewares/auth');

router.use(autenticar, isAdmin);

router.get('/dashboard', dashboard);
router.get('/filmes', listarFilmesAdmin);
router.post('/filmes', criarFilme);
router.put('/filmes/:id', atualizarFilme);
router.delete('/filmes/:id', excluirFilme);
router.get('/usuarios', listarUsuarios);
router.get('/pagamentos', listarPagamentos);
router.post('/pagamentos/:compraId/aprovar', aprovarManual);

module.exports = router;
