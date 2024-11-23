const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Usuario } = require('../models/post');
const sendEmail = require('../modules/mailer'); // Removendo a importação duplicada do 'mailer'
const express = require('express');
const router = express.Router();

async function setupTransport() {
  const hbs = (await import('nodemailer-express-handlebars')).default;

  const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'agrostock01@gmail.com', // Seu email
        pass: 'rcfe herx bobl attt', // Senha de aplicativo do Gmail
    },
});

  transport.use('compile', hbs({
    viewEngine: {
      extName: '.hbs',
      partialsDir: path.resolve('./mail'),  // Verifique se a pasta 'mail' está no lugar certo
      defaultLayout: false,
    },
    viewPath: path.resolve('./mail'),
    extName: '.hbs',
  }));

  return transport;
}

exports.esqueciSenha = async function (req, res) {
  const { email } = req.body;

  try {
    const user = await Usuario.findOne({ where: { email } });

    if (!user) {
      return res.redirect('/?message=Usuario%20nao%20encontrado');
    }

    const token = crypto.randomBytes(20).toString('hex');
    const now = new Date();
    now.setHours(now.getHours() + 1);

    // Atualizar o banco com o token e o tempo de expiração
    await Usuario.update(
      { passwordResetToken: token, passwordResetExpires: now },
      { where: { id: user.id } }
    );

    // Enviar o token e o email para o template de e-mail
    await sendEmail({
      to: email,
      from: 'agrostock01@gmail.com',
      subject: 'Redefinição de Senha',
      template: '../views/forgot_password',
      context: { token, email }, // Inclui o email no contexto
    });

    return res.redirect('/?message=Email%20de%20redefinicao%20de%20senha%20enviado%20com%20sucesso');

  } catch (err) {
    console.error(err);
    return res.redirect('/?message=Erro%20ao%20redefinir%20senha,%20tente%20novamente');
  }
};

//rota para resetar a senha
exports.resetPassword = async function (req, res) {
  const { email, token, senha } = req.body;

  try {
    // Buscar o usuário pelo email e trazer os campos necessários com o Sequelize
    const user = await Usuario.findOne({
      where: { email },
      attributes: ['id', 'passwordResetToken', 'passwordResetExpires', 'senha'], // Especifique os campos necessários
    });

    if (!user) {
      return res.redirect('/?message=Usuario%20nao%20encontrado');
    }

    // Verificar se o token é válido
    if (token !== user.passwordResetToken) {
      return res.redirect('/?message=Token%20invalido');
    }

    // Verificar se o token expirou
    const now = new Date();
    if (now > user.passwordResetExpires) {
      return res.redirect('/?message=Token%20expirado,%20gere%20um%20novo');
    }

    // Atualizar a senha do usuário
    user.senha = senha; // Atualize a senha

    const bcrypt = require('bcryptjs');

    // Criptografando a senha antes de salvar
    user.senha = await bcrypt.hash(senha, 10); // 10 é o número de rounds para o hash

    // Salvar a nova senha no banco de dados
    await user.save();

    return res.redirect('/?message=Senha%20atualizada%20com%20sucesso');
  } catch (err) {
    console.error(err);
    return res.redirect('/?message=Nao%20foi%20possivel%20atualizar%20a%20senha,%20tente%20novamente');
  }
};
