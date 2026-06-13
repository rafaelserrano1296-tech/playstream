const router = require('express').Router();
const { listarFilmes, buscarFilme, verificarAcesso, listarCategorias } = require('../controllers/filmesController');
const { autenticar } = require('../middlewares/auth');

router.get('/', listarFilmes);
router.get('/categorias', listarCategorias);
router.get('/:id', buscarFilme);
router.get('/:id/acesso', autenticar, verificarAcesso);

module.exports = router;
