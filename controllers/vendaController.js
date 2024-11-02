const{TipoProduto, Venda, Comprador} = require("../models/post");


exports.renderizarVenda = async function (req, res) {
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
      const tiposProduto = await TipoProduto.findAll();
  
      const vendasJson = vendas.map(venda => venda.toJSON());
  
      // Renderiza a página passando as vendas e os compradores
      res.render('venda_pag', { 
        vendas: vendasJson,
        compradores,
        tiposProduto,
        isVendasPage: true,  
        isFornecedoresPage: false 
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar vendas.');
    }
  };
  
exports.cadastrarVenda = async function (req, res) {
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

    // Cria a nova venda
    const novaVenda = await Venda.create({
      compradorId: compradorId, // Certifique-se de que este valor é o ID do comprador
      tipo_produtoId: tipo_produto,
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
};

exports.adicionarComprador = async function (req, res) {
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
  
      console.log('Cadastrado com sucesso!')
      res.redirect('/venda-fornecedor');
    } catch (error) {
      console.error('Erro ao cadastrar o comprador:', error);
      res.status(500).json({ message: 'Erro ao cadastrar o comprador' });
    }
  };

  exports.atualizarVenda = async function async (req, res){
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
  };

  
// Deletar venda
exports.deletarVenda = async function (req, res){
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
  };