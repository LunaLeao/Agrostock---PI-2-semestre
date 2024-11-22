const { Usuario, Endereco, Venda, Colheita, Comprador, TipoProduto } = require("../models/post");
const bcrypt = require("bcrypt");
const path = require('path');
const multer = require('multer');

exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email: email } });

    if (!usuario) {
      return res.render("login_pag", {
        backgroundImage: '/img/Ramos.png',
        logoImage: '/img/IMG-20240907-WA0006-removebg-preview.png',
        errorMessage: "Usuário não encontrado."
      });
    }

    const senhaValida = await bcrypt.compare(password, usuario.senha);

    if (!senhaValida) {
      return res.render("login_pag", {
        backgroundImage: '/img/Ramos.png',
        logoImage: '/img/IMG-20240907-WA0006-removebg-preview.png',
        errorMessage: "Senha incorreta."
      });
    }

    req.session.userId = usuario.id;
    req.session.usuario = usuario; // Set usuario in session
    req.session.endereco = await usuario.getEndereco(); // Set endereco in session

    res.redirect("/conta");
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).send("Erro ao fazer login.");
  }
}

exports.cadastrar = async function (req, res) {
  try {
    const { email, cpf, nome, telefone_celular, telefone_residencial, senha, cep, rua, numero, complemento, bairro, cidade, uf, nome_propriedade } = req.body;

    const usuarioExistente = await Usuario.findOne({
      where: {
        [Op.or]: [
          { email: email },
          { cpf: cpf }
        ]
      }
    });

    if (usuarioExistente) {
      return res.render("cadastrar_pag", {
        backgroundImage: '/img/Ramos.png',
        logoImage: '/img/IMG-20240907-WA0006-removebg-preview.png',
        errorMessage: usuarioExistente.email === email ? "E-mail já cadastrado." : "CPF já cadastrado."
      });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const endereco = await Endereco.create({
      cep: cep,
      nome_rua: rua,
      numero: numero,
      complemento: complemento,
      bairro: bairro,
      cidade: cidade,
      uf: uf,
      nome_propriedade: nome_propriedade
    });

    const novoUsuario = await Usuario.create({
      nome: nome,
      email: email,
      telefone_celular: telefone_celular,
      cpf: cpf,
      telefone_residencial: telefone_residencial,
      senha: hashedPassword,
      enderecoId: endereco.id
    });

    res.redirect("/");
  } catch (error) {
    console.error("Erro ao cadastrar dados:", error);
    res.render("cadastrar_pag", {
      backgroundImage: '/img/Ramos.png',
      logoImage: '/img/IMG-20240907-WA0006-removebg-preview.png',
      errorMessage: "Erro ao cadastrar dados"
    });
  }
};

exports.renderizarCadastro = function (req, res) {
  res.render("cadastrar_pag", {
    backgroundImage: '/img/Ramos.png',
    logoImage: '/img/IMG-20240907-WA0006-removebg-preview.png'
  })
}

const { Op } = require('sequelize'); // o que fazemos com isso?

exports.conta = async function (req, res) {
  if (!req.session.userId) {
    return res.redirect("/");
  }

  if (!req.session.usuario || !req.session.endereco) {
    return res.status(404).send("Usuário não encontrado.");
  }


  try {
    const usuarioAtualizado = await Usuario.findByPk(req.session.userId);
  if (!usuarioAtualizado) {
    return res.status(404).send("Usuário não encontrado no banco de dados.");
  }

  // Atualizar os dados da sessão
  req.session.usuario = {
    ...req.session.usuario,
    foto_perfil: usuarioAtualizado.foto_perfil || "/uploads/profile.png",
  };

    const usuario = req.session.usuario;
    const endereco = req.session.endereco;

    let nomePropriedade = "";
    if (endereco) {
      nomePropriedade = endereco.nome_propriedade ? endereco.nome_propriedade : " ";
    }

    
    // Buscar a última venda do usuário
    const ultimaVenda = await Venda.findOne({
      where: { usuarioId: req.session.userId },
      order: [['data_venda', 'DESC']],
      include: [
        {
          model: Comprador, 
          attributes: ['nome'] 
        },
        {
          model: TipoProduto, 
          attributes: ['nome'] 
        }
      ]
    });

    // Buscar a última colheita do usuário
    const ultimaColheita = await Colheita.findOne({
      where: { usuarioId: req.session.userId },
      order: [['data_colheita', 'DESC']],
      include: [
        {
          model: TipoProduto, // Incluir tipo de produto
          attributes: ['nome'] // Substitua pelos atributos que deseja exibir
        }
      ]
    });

    res.render("conta_pag", {
      backgroundImage: '/img/Ramos.png',
      logoImage: '/img/IMG-20240907-WA0006-removebg-preview.png',
      usuario: {
        nome: usuario.nome,
        nome_propriedade: nomePropriedade,
        email: usuario.email,
        telefone_celular: usuario.telefone_celular,
        telefone_residencial: usuario.telefone_residencial,
        foto_perfil: usuario.foto_perfil,
      },
      endereco: {
        cep: endereco.cep,
        logradouro: endereco.nome_rua,
        numero: endereco.numero,
        complemento: endereco.complemento,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        uf: endereco.uf,
        propriedade_rural: endereco.nome_propriedade
      },
      ultimaVenda,
      ultimaColheita,
    });
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);
    res.status(500).send("Erro ao carregar dados do usuário.");
  }
};


// Página de edição de conta
exports.editar_conta = async function (req, res) {
  if (!req.session.userId) {
    return res.redirect("/");
  }

  try {
    const usuario = await Usuario.findByPk(req.session.userId, {
      include: [{
        model: Endereco,
        as: 'endereco'
      }]
    });

    if (!usuario) {
      return res.status(404).send("Usuário não encontrado.");
    }

    res.render("editar_conta", {
      usuario: usuario,
      endereco: usuario.endereco,

    });
  } catch (error) {
    console.error("Erro ao carregar a página de edição:", error);
    res.status(500).send("Erro ao carregar a página de edição .");
  }
};

exports.atualizar_conta = async function (req, res) {
  if (!req.session.userId) {
    return res.redirect("/");
  }

  try {
    const usuario = await Usuario.findByPk(req.session.userId, {
      include: [{
        model: Endereco,
        as: 'endereco'
      }]
    });

    if (!usuario) {
      return res.status(404).send("Usuário não encontrado.");
    }

    const {
      nome,
      email,
      telefone_celular,
      telefone_residencial,
      cpf,
      bairro,
      nome_rua,
      numero,
      cep,
      nome_propriedade,
      complemento,
      cidade,
      uf
    } = req.body;

    // Atualizar o endereço
    if (usuario.endereco) {
      await usuario.endereco.update({
        bairro,
        nome_rua,
        numero,
        cep,
        nome_propriedade,
        complemento,
        cidade,
        uf
      });
    } else {
      // Criar um novo endereço se não existir
      const endereco = await Endereco.create({
        bairro,
        nome_rua,
        numero,
        cep,
        nome_propriedade,
        complemento,
        cidade,
        uf
      });
      usuario.enderecoId = endereco.id;
    }

    // Atualizar o usuário
    usuario.nome = nome;
    usuario.email = email;
    usuario.telefone_celular = telefone_celular;
    usuario.telefone_residencial = telefone_residencial;
    usuario.cpf = cpf;
    await usuario.save();

    req.session.usuario = usuario;
    req.session.endereco = usuario.endereco;

    res.redirect('/conta');
  } catch (error) {
    console.error("Erro ao atualizar conta:", error);
    res.status(500).send("Erro ao atualizar conta.");
  }
};

//Excluir conta

exports.excluir_conta = async function (req, res) {
  try {
    const usuario = await Usuario.findOne({ where: { id: req.session.userId } });

    if (usuario) {
      // Excluir o usuário
      await usuario.destroy();
      res.redirect('/'); // Redireciona para a página inicial após a exclusão
    } else {
      res.status(404).send('Usuário não encontrado.');
    }
  } catch (error) {
    console.error('Erro ao excluir o usuário:', error);
    res.status(500).send('Erro ao excluir o usuário.');
  }
};

// mudar senha


exports.mudar_senha = async function (req, res) {
  if (!req.session.userId) {
    return res.redirect("/");
  }

  const { senhaAtual, novaSenha, confirmarSenha } = req.body;

  // Expressão regular para validar a nova senha
  const regexSenha = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;

  // Verificar se as senhas correspondem
  if (novaSenha !== confirmarSenha) {
    return res.redirect('/conta?error=true');
  }

  // Verificar se a nova senha atende aos critérios de validação
  if (!regexSenha.test(novaSenha)) {
    return res.redirect('/conta?invalid_password=true');
  }

  try {
    const usuario = await Usuario.findByPk(req.session.userId);

    if (!usuario) {
      return res.redirect('/conta?error=true');
    }

    // Verificar se a senha atual está correta
    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaCorreta) {
      return res.redirect('/conta?error=true');
    }

    // Hash da nova senha e salvar
    const novaSenhaHashed = await bcrypt.hash(novaSenha, 10);
    usuario.senha = novaSenhaHashed;
    await usuario.save();

    return res.redirect('/conta?success=true');
  } catch (error) {
    console.error("Erro ao mudar a senha:", error);
    return res.redirect('/conta?error=true');
  }
};

// Atualizar a foto de perfil
exports.editarFoto = async (req, res) => {
  try {
    // Verifica se o arquivo foi recebido
    if (!req.file) {
      console.error("Nenhum arquivo foi enviado.");
      return res.status(400).send("Nenhum arquivo foi enviado.");
    }

    // Verifica se o usuário está logado
    if (!req.session.userId) {
      console.error("Usuário não autenticado.");
      return res.status(401).send("Usuário não autenticado.");
    }

    const fotoPath = '/uploads/' + req.file.filename; // Caminho do arquivo salvo
    console.log("Foto salva em:", fotoPath);

    // Atualiza a foto no banco de dados
    await Usuario.update(
      { foto_perfil: fotoPath },
      { where: { id: req.session.userId } }
    );

    res.redirect('/conta');
  } catch (error) {
    console.error("Erro ao atualizar a foto de perfil:", error);
    res.status(500).send("Erro ao atualizar a foto de perfil.");
  }
};

exports.exibirPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.session.userId);
    if (!usuario) {
      return res.status(404).send("Usuário não encontrado.");
    }
    res.render('conta_pag', { usuario });
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    res.status(500).send("Erro ao carregar perfil.");
  }
};



