const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const multer = require('multer');


router.post("/login", usuarioController.login);
router.get("/cadastro", usuarioController.renderizarCadastro);
router.post("/cadastrar", usuarioController.cadastrar);
router.get("/conta", usuarioController.conta);
router.post("/editar-conta", usuarioController.editar_conta);
router.post("/atualizar-conta", usuarioController.atualizar_conta);
router.post("/excluir-conta", usuarioController.excluir_conta);
router.post("/mudar-senha", usuarioController.mudar_senha);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/'); // Certifique-se de que esta pasta existe
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5 MB
  });
  
  router.post('/editar-perfil', upload.single('foto'), usuarioController.editarFoto);
  

module.exports = router;