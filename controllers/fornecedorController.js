const { Fornecedor, Endereco } = require("../models/post"); // Importa o modelo Fornecedor

exports.renderizarFornecedor = async function (req, res) {
  try {
    if (!req.session.userId) {
      return res.status(403).send('Usuário não autorizado');
    }

    // Busca todos os fornecedores junto com seus endereços
    const fornecedores = await Fornecedor.findAll({
      include: [{
        model: Endereco, // Incluindo o modelo Endereco
        required: false // Pode ser true se você quiser apenas fornecedores que têm endereço
      }]
    });

    res.render('fornecedor_pag', { 
      fornecedores,
      isFornecedoresPage: true, 
      isVendasPage: false 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar fornecedores.');
  }
};

exports.adicionarFornecedor = async function (req, res) {
  const { nome, telefone, cnpj, cep, rua, numero, complemento, bairro, cidade, uf } = req.body;

  try {
    // Primeiro, crie o endereço
    const endereco = await Endereco.create({
      cep,
      nome_rua: rua,
      numero,
      complemento,
      bairro,
      cidade,
      uf
    });

    // Em seguida, crie o fornecedor associado ao endereço
    await Fornecedor.create({
      nome,
      telefone,
      cnpj,
      enderecoId: endereco.id // Associe o endereço ao fornecedor
    });

    console.log('Fornecedor cadastrado com sucesso!');
    res.redirect('/fornecedores');
  } catch (error) {
    console.error('Erro ao adicionar fornecedor:', error);
    res.status(500).json({ message: 'Erro ao adicionar fornecedor' });
  }
};

exports.atualizarFornecedor = async function (req, res) {
  try {
      const { fornecedorId, nome, telefone, cnpj, cep, rua, numero, complemento, bairro, cidade, uf } = req.body;

      // Atualiza o fornecedor
      await Fornecedor.update({ nome, telefone, cnpj }, { where: { id: fornecedorId } });

      // Atualiza o endereço
      const endereco = {
          cep,
          nome_rua: rua,
          numero,
          complemento,
          bairro,
          cidade,
          uf
      };

      // Encontre o endereço relacionado ao fornecedor
      const fornecedor = await Fornecedor.findByPk(fornecedorId);
      if (!fornecedor) {
          return res.status(404).json({ message: 'Fornecedor não encontrado' });
      }

      // Atualiza o endereço utilizando o enderecoId
      await Endereco.update(endereco, {
          where: { id: fornecedor.enderecoId } // Use enderecoId para buscar o endereço
      });

      console.log('Fornecedor atualizado com sucesso!');
      res.redirect('/fornecedores');
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar fornecedor ou endereço' });
  }
};



exports.deletarFornecedor = async function (req, res){
  try {
    const id = req.params.id;
    const fornecedor = await Fornecedor.destroy({ where: { id } });
  
    if (!fornecedor) {
      return res.status(404).json({ message: 'Fornecedor não encontrado' });
    }
  
    res.status(200).json({ message: 'Fornecedor excluído com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao excluir o Fornecedor' });
  }
};

  