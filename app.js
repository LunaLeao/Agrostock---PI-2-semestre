const express = require("express");
const app = express();
const handlebars = require("express-handlebars").engine;
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const path = require('path');
const session = require('express-session');

const { Usuario, Endereco, Colheita, TipoInsumo, Fornecedor ,TipoProduto, Insumo, Venda, Comprador } = require("./models/post");


const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('pt-BR', options);
};

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'chave123@',
  resave: false,
  saveUninitialized: false
}));

app.set('views', path.join(__dirname, 'views'));

app.engine('handlebars', handlebars({ 
  defaultLayout: 'main',
  helpers: {
    formatDate: formatDate
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true, // Adicione esta linha
    allowProtoMethodsByDefault: true, // E esta linha, se necessário
}
}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Página inicial
app.get("/", function (req, res) {
  res.render("primeira_pag", {
    backgroundImage: '/img/Ramos.png',
    logoImage: '/img/IMG-20240907-WA0006-removebg-preview.png'
  });
});

// Login
app.post("/login", async function (req, res) {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email: email } });

    if (!usuario) {
      return res.render("primeira_pag", {
        backgroundImage: '/img/Ramos.png',
        logoImage: '/img/IMG-20240907-WA0006-removebg-preview.png',
        errorMessage: "Usuário não encontrado."
      });
    }

    const senhaValida = await bcrypt.compare(password, usuario.senha);

    if (!senhaValida) {
      return res.render("primeira_pag", {
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
});
// Página de cadastro
app.get("/cadastro", function (req, res) {
  res.render("segunda_pag", {
    backgroundImage: '/img/Ramos.png',
    logoImage: '/img/IMG-20240907-WA0006-removebg-preview.png'
  });
});

const { Op } = require('sequelize');

app.post("/cadastrar", async function (req, res) {
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
      return res.render("segunda_pag", {
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
    res.render("segunda_pag", {
      backgroundImage: '/img/Ramos.png',
      logoImage: '/img/IMG-20240907-WA0006-removebg-preview.png',
      errorMessage: "Erro ao cadastrar dados"
    });
  }
});

// Página "Sua Conta"
app.get("/conta", async function (req, res) {
  if (!req.session.userId) {
    return res.redirect("/");
  }
  if (!req.session.usuario || !req.session.endereco) {
    return res.status(404).send("Usuário não encontrado.");
  }
  try {
    const usuario = req.session.usuario;
    const endereco = req.session.endereco;

    let nomePropriedade = "";
    if (endereco) {
      nomePropriedade = endereco.nome_propriedade ? endereco.nome_propriedade : " ";
    }

    res.render("terceira_pag", {
      backgroundImage: '/img/Ramos.png',
      logoImage: '/img/IMG-20240907-WA0006-removebg-preview.png',
      usuario: {
        nome: usuario.nome,
        nome_propriedade: nomePropriedade,
        email: usuario.email,
        telefone_celular: usuario.telefone_celular,
        telefone_residencial: usuario.telefone_residencial,
      }
    });
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);
    res.status(500).send("Erro ao carregar dados do usuário.");
  }
});

// Página de edição de conta
app.get("/editar-conta", async function (req, res) {
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
});

// Atualizar dados do usuário
app.post("/atualizar-conta", async function (req, res) {
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
});


app.post('/excluir-conta', async (req, res) => {
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
});

app.post("/mudar-senha", async function (req, res) {
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
});

//Colheita
app.get('/colheitas', async (req, res) => {
  try {
      // Verifica se o usuário está logado
      if (!req.session.userId) {
          return res.status(403).send('Usuário não autorizado');
      }

      const colheitas = await Colheita.findAll({
          where: { usuarioId: req.session.userId }, // Filtra pelas colheitas do usuário logado
          include: [{ model: TipoProduto }],
      });

      // Buscar todos os tipos de produtos
      const tiposProduto = await TipoProduto.findAll();

      const colheitasJson = colheitas.map(colheita => colheita.toJSON());

      res.render('quarta_pag', { colheitas: colheitasJson, tiposProduto });
  } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar colheitas.');
  }
});

//Cadastrar uma nova colheita
app.post('/add-colheita', async (req, res) => {
  try {
      const { nome_colheita, tipo_produto, tipo_insumo, quantidade, data_colheita, observacao } = req.body;

      // Verifica se o usuário está logado
      if (!req.session.userId) {
          return res.status(403).json({ message: 'Usuário não autorizado' });
      }

      // Verifica se o tipo de produto já existe
      const [produtoExistente, created] = await TipoProduto.findOrCreate({
          where: { nome: tipo_produto },  
          defaults: { nome: tipo_produto } 
      });

      // Cria a nova colheita
      const novaColheita = await Colheita.create({
          nome_colheita,
          tipo_produtoId: produtoExistente.id, 
          tipo_insumoId: tipo_insumo, 
          quantidade,
          data_colheita,
          observacao,
          usuarioId: req.session.userId
      });

      res.redirect('/colheitas');
  } catch (error) {
      console.error('Erro ao cadastrar colheita:', error);
      res.status(500).json({ message: 'Erro ao cadastrar a colheita' });
  }
});

//Atualizar Colheita
app.post('/atualizar-colheita', async (req, res) => {
  const { colheitaId, quantidade, tipo_produtoId, data_colheita } = req.body;

  try {
      await Colheita.update(
          {
              colheitaId: colheitaId,
              quantidade: quantidade,
              tipo_produtoId: tipo_produtoId,
              data_colheita: new Date(data_colheita),
          },
          {
              where: { id: colheitaId },
          }
      );

      res.redirect('/colheitas'); // Redirecione para a página de colheitas
  } catch (error) {
      console.error('Erro ao atualizar a colheita:', error);
      res.status(500).send('Erro ao atualizar a colheita');
  }
});

//Deletar colheita
app.delete('/colheitas/:id', async (req, res) => {
  try {
      const id = req.params.id;
      const colheita = await Colheita.destroy({ where: { id } });
      
      if (!colheita) {
          return res.status(404).json({ message: 'Colheita não encontrada' });
      }
      
      res.status(200).json({ message: 'Colheita excluída com sucesso' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao excluir a colheita' });
  }
});

app.get('/venda-fornecedor', async (req, res) => {
  try {
      // Verifica se o usuário está logado
      if (!req.session.userId) {
          return res.status(403).send('Usuário não autorizado');
      }

      // Busca todas as vendas do usuário logado
      const vendas = await Venda.findAll({
          where: { usuarioId: req.session.userId }, // Filtra pelas vendas do usuário logado
          include: [
              { model: TipoProduto },
              { model: Comprador } // Inclui o modelo de Comprador
          ],
      });

      // Busca todos os compradores do banco de dados
      const compradores = await Comprador.findAll();

      const vendasJson = vendas.map(venda => venda.toJSON());

      // Renderiza a página passando as vendas e os compradores
      res.render('quinta_pag', { vendas: vendasJson, compradores });
  } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar vendas.');
  }
});



//Cadastrar uma nova venda
app.post('/add-vendas', async (req, res) => {
  try {
      // Extrai os dados do corpo da requisição
      const { compradorId, tipo_produto, valor_total, quantidade, data_venda, observacao } = req.body;

      // Verifica se o usuário está logado
      if (!req.session.userId) {
          return res.status(403).json({ message: 'Usuário não autorizado' });
      }

      // Verifica se o compradorId foi fornecido
      if (!compradorId) {
          return res.status(400).json({ message: 'ID do comprador é obrigatório.' });
      }

      // Verifica se o tipo de produto já existe ou cria um novo
      const [produtoExistente] = await TipoProduto.findOrCreate({
          where: { nome: tipo_produto },  
          defaults: { nome: tipo_produto } 
      });

      // Cria a nova venda
      const novaVenda = await Venda.create({
          compradorId: compradorId, // Certifique-se de que este valor é o ID do comprador
          tipo_produtoId: produtoExistente.id, 
          valor_total,
          quantidade,
          data_venda,
          observacao,
          usuarioId: req.session.userId // ID do usuário que está logado
      });

      // Redireciona após o sucesso
      res.redirect('/venda-fornecedor');
  } catch (error) {
      console.error('Erro ao cadastrar a venda:', error);
      res.status(500).json({ message: 'Erro ao cadastrar a venda', error: error.message });
  }
});


//comprador
app.post('/add-comprador', async (req, res) => {
  try {
      const { nome, telefone, email } = req.body;

      // Verifica se o comprador já existe pelo email
      const compradorExistente = await Comprador.findOne({ where: { email } });
      if (compradorExistente) {
          return res.status(400).json({ message: 'Comprador já existe com este email.' });
      }

      // Cria o novo comprador
      const novoComprador = await Comprador.create({
          nome,
          telefone,
          email
      });

      res.status(201).json({ message: 'Comprador adicionado com sucesso!', comprador: novoComprador });
  } catch (error) {
      console.error('Erro ao cadastrar o comprador:', error);
      res.status(500).json({ message: 'Erro ao cadastrar o comprador' });
  }
});

//Atualizar venda
app.post('/atualizar-vendas', async (req, res) => {
  const { vendaId, compradorId, quantidade, valor_total, tipo_produtoId, data_venda } = req.body;

  try {
      await Venda.update(
          {
              compradorId: compradorId,
              quantidade: quantidade,
              valor_total,
              tipo_produtoId: tipo_produtoId,
              data_venda: new Date(data_venda),
          },
          {
              where: { id: vendaId },
          }
      );

      res.redirect('/venda-fornecedor'); // Redirecione para a página de vendas
  } catch (error) {
      console.error('Erro ao atualizar a venda:', error);
      res.status(500).send('Erro ao atualizar a venda');
  }
});


// Deletar venda
app.delete('/vendas/:id', async (req, res) => {
  try {
      const id = req.params.id;
      const venda = await Venda.destroy({ where: { id } });
      
      if (!venda) {
          return res.status(404).json({ message: 'Venda não encontrada' });
      }
      
      res.status(200).json({ message: 'Venda excluída com sucesso' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao excluir a venda' });
  }
});



//Insumo
app.get('/insumos', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(403).send('Usuário não autorizado');
    }

    // Buscar todos os insumos com o nome do TipoInsumo incluído
    const insumos = await Insumo.findAll({
      include: {
        model: TipoInsumo,
        attributes: ['nome']  // Carregar o nome do TipoInsumo
      }
    });

    // Buscar todos os tipos de insumo
    const tiposInsumo = await TipoInsumo.findAll();

    // Buscar todos os fornecedores
    const fornecedores = await Fornecedor.findAll();

    // Converter os dados para JSON
    const insumosJson = insumos.map(insumo => insumo.toJSON());
    const tiposInsumoJson = tiposInsumo.map(tipo => tipo.toJSON());
    const fornecedoresJson = fornecedores.map(fornecedor => fornecedor.toJSON());

    // Renderizar a página e enviar os dados
    res.render('sexta_pag', {
      insumos: insumosJson,
      tiposInsumo: tiposInsumoJson,
      fornecedores: fornecedoresJson
    });

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).send('Erro ao buscar dados.');
  }
});

// Deletar insumo
app.delete('/insumos/:id', async (req, res) => {
  try {
      const id = req.params.id;
      const insumo = await Insumo.destroy({ where: { id } });

      if (!insumo) {
          return res.status(404).json({ message: 'Insumo não encontrado' });
      }

      res.status(200).json({ message: 'Insumo excluído com sucesso' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao excluir o insumo' });
  }
});

// Cadastrar um novo insumo
app.post('/add-insumos', async (req, res) => {
  try {
    const { tipoInsumo, fornecedor, validade, quantidade, novoTipo, novoFornecedorNome, novoFornecedorTelefone } = req.body;

    // Verifica se o usuário está logado
    if (!req.session.userId) {
      return res.status(403).json({ message: 'Usuário não autorizado' });
    }

    // Verifica se o tipo de insumo já existe ou cria um novo
    let tipoInsumoId;
    if (tipoInsumo) {
      tipoInsumoId = tipoInsumo;
    } else if (novoTipo) {
      const [novoTipoInsumo] = await TipoProduto.findOrCreate({
        where: { nome: novoTipo },
        defaults: { nome: novoTipo }
      });
      tipoInsumoId = novoTipoInsumo.id;
    }

    // Verifica se o fornecedor já existe ou cria um novo
    let fornecedorId;
    if (fornecedor) {
      fornecedorId = fornecedor;
    } else if (novoFornecedorNome && novoFornecedorTelefone) {
      const [novoFornecedor] = await Fornecedor.findOrCreate({
        where: { nome: novoFornecedorNome },
        defaults: { nome: novoFornecedorNome, telefone: novoFornecedorTelefone }
      });
      fornecedorId = novoFornecedor.id;
    }

    // Cria o novo insumo
    const novoInsumo = await Insumo.create({
      fornecedorId: fornecedorId,
      tipo_insumoId: tipoInsumoId,
      validade,
      quantidade,
      usuarioId: req.session.userId
    });

        // Buscar todos os insumos
        const insumos = await Insumo.findAll();

        // Buscar todos os tipos de insumo
        const tiposInsumo = await TipoInsumo.findAll(); // Supondo que você tenha o modelo `TipoInsumo`
    
        // Buscar todos os fornecedores
        const fornecedores = await Fornecedor.findAll(); // Supondo que você tenha o modelo `Fornecedor`
    
      // Converter os dados para JSON
      const insumosJson = insumos.map(insumo => insumo.toJSON());
      const tiposInsumoJson = tiposInsumo.map(tipo => tipo.toJSON());
      const fornecedoresJson = fornecedores.map(fornecedor => fornecedor.toJSON());


      // Renderizar a página e enviar os dados
      res.render('sexta_pag', {
        insumos: insumosJson,
        tiposInsumo: tiposInsumoJson,
        fornecedores: fornecedoresJson // Enviar também os fornecedores
      });
  } catch (error) {
    console.error('Erro ao cadastrar o insumo:', error);
    res.status(500).json({ message: 'Erro ao cadastrar o insumo' });
  }
});

// Endpoint para adicionar um novo tipo de insumo

app.post('/add-tipo-insumo', async (req, res) => {
  try {
      const { novoTipo } = req.body;

      // Cria ou encontra um tipo de insumo existente
      const [tipoInsumo, created] = await TipoInsumo.findOrCreate({
          where: { nome: novoTipo },
          defaults: { nome: novoTipo }
      });

      if (created) {
          res.status(201).json({ message: 'Tipo de insumo adicionado com sucesso!' });
      } else {
          res.status(400).json({ message: 'Tipo de insumo já existe.' });
      }
  } catch (error) {
      console.error('Erro ao adicionar tipo de insumo:', error);
      res.status(500).json({ message: 'Erro ao adicionar tipo de insumo' });
  }
});



// Endpoint para adicionar um novo fornecedor
app.post('/add-fornecedor', async (req, res) => {
  const { nome, telefone } = req.body;
  try {
      const fornecedor = await Fornecedor.create({ nome, telefone });
      res.status(201).json(fornecedor);
  } catch (error) {
      console.error('Erro ao adicionar fornecedor:', error);
      res.status(500).json({ message: 'Erro ao adicionar fornecedor' });
  }
});



// Endpoint para atualizar o insumo
app.post('/atualizar-insumo', async (req, res) => {
  const { insumoId, tipoInsumo, quantidade, validade } = req.body;

  // Log para verificar se os dados estão sendo recebidos corretamente
  console.log('InsumoId:', insumoId);
  console.log('TipoInsumo:', tipoInsumo);
  console.log('Quantidade:', quantidade);
  console.log('Validade:', validade);

  if (!insumoId) {
      return res.status(400).json({ message: 'Insumo ID não fornecido' });
  }

  try {
      // Atualiza o insumo no banco de dados
      await Insumo.update(
          {
              tipo_produtoId: tipoInsumo,  // ID do tipo de produto
              quantidade: quantidade,
              validade: new Date(validade), // Certifique-se de que a data está no formato correto
          },
          {
              where: { id: insumoId },  // Onde o insumo tem o ID igual ao fornecido
          }
      );

      res.redirect('/insumos')
  } catch (error) {
      console.error('Erro ao atualizar o insumo:', error);
      res.status(500).json({ message: 'Erro ao atualizar o insumo' });
  }
});

//Deletar insumo
app.delete('/insumos/:id', async (req, res) => {
  try {
      const id = req.params.id;
      const insumo = await Insumo.destroy({ where: { id } });
      
      if (!insumo) {
          return res.status(404).json({ message: 'Insumo não encontrado' });
      }
      
      res.status(200).json({ message: 'Insumo excluída com sucesso' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao excluir a Insumo' });
  }
});


// Inicialização do servidor
app.listen(8082, function () {
  console.log("Servidor rodando na porta 8081");
});