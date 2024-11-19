const express = require("express");
const router = express.Router();

const authController = require("../controllers/authenticator/authController");

router.post('/forgot_password', authController.esqueciSenha);
router.post('/reset_password1', authController.resetPassword);

module.exports = router;
