const { Usuario } = require("../models/post");
const bcrypt = require("bcrypt");

const { Op } = require('sequelize'); // Certifique-se de importar os operadores do Sequelize



exports.redefinirSenhaGet = async function (req, res) {
    const { token, email } = req.query; // Pega o token e o email da query string
  
    // Verifica se o token foi fornecido
    if (!token || !email) {
      console.log("Token ou email não fornecido."); // Log caso o token ou email não tenha sido fornecido
      return res.render('redefinir_senha', { token: null, email: null }); // Renderiza a página com token e email null
    }
  
    console.log(`Recebido token: ${token}, email: ${email}`); // Log para verificar o token e email recebidos
  
    try {
      // Realiza a consulta no banco de dados
      const user = await Usuario.findOne({
        where: {
          email, // Verifica o email correspondente
          passwordResetToken: token, // Verifica o token
          passwordResetExpires: { [Op.gt]: new Date() } // Verifica se o token ainda é válido
        }
      });
  
      console.log(`Consulta executada para token: ${token} e email: ${email}`); // Log após execução da consulta
  
      if (!user) {
        console.log("Token inválido ou expirado, ou email não corresponde."); // Log para indicar erro na validação
        return res.render('redefinir_senha', { token: null, email: null }); // Renderiza a página com token e email null
      }
  
      console.log("Usuário encontrado:", user.toJSON()); // Loga os dados do usuário encontrado
  
      // Renderiza a página de redefinir senha passando o token e email
      res.render('redefinir_senha', { token, email });
    } catch (err) {
      console.error("Erro ao processar a solicitação:", err);
      return res.status(500).send("Erro ao processar a solicitação.");
    }
};

  

// Rota para salvar a nova senha do usuário
exports.redefinirSenhaPost = async function (req, res) {
    console.log("Rota redefinirSenhaPost chamada");
  
    const { email, token, senha } = req.body; // Certifique-se de que os nomes estão corretos.
    
    console.log("Recebido email:", email);
    console.log("Recebido token:", token);
    console.log("Recebido senha:", senha);
  
    // Verificar se todos os campos necessários foram fornecidos
    if (!email || !token || !senha) {
      return res.status(400).send("Todos os campos (email, token, senha) são obrigatórios.");
    }
  
    try {
      // Encontrar o usuário pelo email e token
      const user = await Usuario.findOne({
        where: {
          email, // Certifique-se de que o campo existe na tabela
          passwordResetToken: token,
          passwordResetExpires: { [Op.gt]: new Date() },
        },
      });
  
      if (!user) {
        return res.status(400).send("Token inválido, expirado ou usuário não encontrado.");
      }
  
      // Atualizar a senha
      const hashedPassword = await bcrypt.hash(senha, 10);
      user.senha = hashedPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();
  
      res.send("Senha redefinida com sucesso!");
    } catch (err) {
      console.error("Erro ao redefinir senha:", err);
      res.status(500).send("Erro ao redefinir senha.");
    }
  };