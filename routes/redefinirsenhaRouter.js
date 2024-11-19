const express = require("express");
const router = express.Router();

const redefinirController = require('../controllers/redefinirsenhaController');

router.get("/redefinir_senha", redefinirController.redefinirSenhaGet);
router.post("/reset_password", redefinirController.redefinirSenhaPost);

module.exports = router;