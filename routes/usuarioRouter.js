const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuarioController");

// Login
router.post("/login", usuarioController.login);

router.get("/cadastro", usuarioController.renderizarCadastro);
router.post("/cadastrar", usuarioController.cadastrar);

router.get("/conta", usuarioController.conta);
router.post("/editar-conta", usuarioController.editar_conta);
router.post("/atualizar-conta", usuarioController.atualizar_conta);
router.post("/excluir-conta", usuarioController.excluir_conta);
router.post("/mudar-senha", usuarioController.mudar_senha);
module.exports = router;