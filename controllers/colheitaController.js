const { Colheita, TipoProduto } = require("../models/post");
const { Op } = require('sequelize');
const db = require('../models'); 

exports.renderizarColheita = async function (req, res) {
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

    res.render('colheita_pag', { colheitas: colheitasJson, tiposProduto });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar colheitas.');
  }
};

exports.adicionarColheita = async function (req, res) {
  try {
    const { nome_colheita, tipo_produto, quantidade, data_colheita, observacao } = req.body;

    // Verifica se o usuário está logado
    if (!req.session.userId) {
      return res.status(403).json({ message: 'Usuário não autorizado' });
    }

    // Verifica se o tipo de produto já existe ou cria um novo
    const [produtoExistente] = await TipoProduto.findOrCreate({
      where: { id: tipo_produto }, // Alterado para buscar pelo ID
      defaults: { nome: tipo_produto } // Se você quiser que ele também crie um novo, você pode mantê-lo
    });

    // Cria a nova colheita
    const novaColheita = await Colheita.create({
      nome_colheita,
      tipo_produtoId: produtoExistente.id, // Usa o ID do produto existente
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
};

exports.atualizarColheita = async function (req, res) {
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
};

exports.deletarColheita = async function (req, res) {
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
};

exports.adicionarTipoProduto = async function (req, res) {
  const { novoTipo } = req.body; // Obter o tipo de produto do corpo da requisição
  try {
      // Tenta criar um novo tipo de produto
      const tipoProduto = await TipoProduto.create({ nome: novoTipo });
      // Retorna o novo tipo de produto em formato JSON
      res.status(201).json({ message: 'Tipo de produto adicionado com sucesso!', tipoProduto });
  } catch (error) {
      console.error('Erro ao adicionar tipo de produto:', error);
      // Retorna uma mensagem de erro em caso de falha
      res.status(500).json({ message: 'Erro ao adicionar tipo de produto' });
  }
};
// Pesquisar colheitas
exports.pesquisarColheita = async (req, res) => {
  try {
    const { termo, campo } = req.query;
    let whereClause = {};

    if (campo === 'nome_colheita') {
      whereClause['nome_colheita'] = { [Op.like]: `%${termo}%` };
    } else if (campo === 'tipo_produto') {
      whereClause['$tipo_produto.nome$'] = { [Op.like]: `%${termo}%` };
    } else if (campo === 'quantidade') {
      whereClause['quantidade'] = { [Op.like]: `%${termo}%` };
    }

    const colheitas = await Colheita.findAll({
      where: whereClause,
      include: [
        { model: TipoProduto, as: 'tipo_produto', required: true }
      ],
    });

    res.render('colheita_pag', colheitas.length > 0 ? { colheitas } : { colheitas: [], mensagem: 'Nenhuma colheita encontrada' });
  } catch (error) {
    console.error('Erro ao buscar colheitas:', error);
    res.status(500).send({ error: 'Erro ao buscar colheitas' });
  }
};