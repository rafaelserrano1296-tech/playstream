const router = require('express').Router();
const { cadastrar, login, solicitarResetSenha, resetarSenha, perfil } = require('../controllers/authController');
const { autenticar } = require('../middlewares/auth');

router.post('/cadastrar', cadastrar);
router.post('/login', login);
router.post('/solicitar-reset', solicitarResetSenha);
router.post('/reset-senha', resetarSenha);
router.get('/perfil', autenticar, perfil);

module.exports = router;
