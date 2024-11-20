const { Colheita, TipoProduto } = require("../models/post");
const { Op } = require('sequelize');
const db = require('../models'); 
const PDFDocument = require('pdfkit');
const path = require('path');

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
  const { colheitaId, nome_colheita, quantidade, tipo_produtoId, data_colheita } = req.body;

  console.log('Dados recebidos:', req.body);  // Verifique se os dados estão sendo recebidos corretamente

  try {
    // Atualize todos os campos, incluindo nome_colheita
    await Colheita.update(
      {
        nome_colheita: nome_colheita,  // Adicione este campo
        quantidade: quantidade,
        tipo_produtoId: tipo_produtoId,
        data_colheita: new Date(data_colheita),
      },
      {
        where: { id: colheitaId }, // Verifique se o ID está correto
      }
    );

    res.redirect('/colheitas'); // Redirecionar para a página de colheitas
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

exports.gerarRelatorio = (req, res) => {
  const colheitas = req.body.colheitas; // Recebe os dados enviados
  const usuario = req.session.usuario;

  // Criar um novo documento PDF
  const doc = new PDFDocument();
  

  // Definir o cabeçalho da resposta como PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=relatorio_mensal.pdf');

  const imagePath = path.join(__dirname, '../public/img/IMG-20240907-WA0006.jpg'); // Caminho absoluto para a imagem
  doc.image(imagePath, 30, 30, { width: 100, height: 100 });
  doc.moveDown(); // Desce após a imagem para não sobrepor os textos

  // Pipe o conteúdo do PDF para a resposta HTTP
  doc.pipe(res);

  // Adicionar título ao PDF
  doc.fontSize(20).text('Relatório de Estoque de Colheitas', { align: 'center' });
  doc.moveDown();

  // Adicionar informações do usuário (nome, email e telefone)
  doc.fontSize(12).text(`Nome: ${usuario.nome}`, { align: 'left' });
  doc.text(`Email: ${usuario.email}`, { align: 'left' });
  doc.text(`Telefone: ${usuario.telefone_celular}`, { align: 'left' });
  doc.moveDown(); // Espaçamento antes de iniciar a tabela

  // Definir a largura das colunas
  const colWidth1 = 140;  // Nome da Colheita
  const colWidth2 = 100;  // Tipo
  const colWidth3 = 80;  // Quantidade
  const colWidth4 = 200;  // Data de Registro

  // Definir a altura das linhas
  const rowHeight = 20;
  const tableTop = doc.y;

  // Cabeçalho da tabela
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Nome da Colheita', 30, tableTop, { width: colWidth1, align: 'center' });
  doc.text('Tipo', 30 + colWidth1, tableTop, { width: colWidth2, align: 'center' });
  doc.text('Quantidade', 30 + colWidth1 + colWidth2, tableTop, { width: colWidth3, align: 'center' });
  doc.text('Data de Registro', 30 + colWidth1 + colWidth2 + colWidth3, tableTop, { width: colWidth4, align: 'center' });

  // Criar uma linha abaixo do cabeçalho
  doc.lineWidth(1).moveTo(30, tableTop + rowHeight).lineTo(580, tableTop + rowHeight).stroke();
  doc.moveDown();

  // Adicionar os dados das colheitas
  colheitas.forEach((colheita, index) => {
    const yPosition = tableTop + rowHeight * (index + 2); // Posição para cada linha

    doc.fontSize(12).font('Helvetica');
    doc.text(colheita.nome_colheita, 30, yPosition, { width: colWidth1, align: 'center' });
    doc.text(colheita.tipo_produto, 30 + colWidth1, yPosition, { width: colWidth2, align: 'center' });
    doc.text(colheita.quantidade.toString(), 30 + colWidth1 + colWidth2, yPosition, { width: colWidth3, align: 'center' });
    doc.text(colheita.data_colheita, 30 + colWidth1 + colWidth2 + colWidth3, yPosition, { align: 'center' });

    // Adicionar bordas nas células
    doc.rect(30, yPosition - 3, colWidth1, rowHeight).stroke();
    doc.rect(30 + colWidth1, yPosition - 3, colWidth2, rowHeight).stroke();
    doc.rect(30 + colWidth1 + colWidth2, yPosition - 3, colWidth3, rowHeight).stroke();
    doc.rect(30 + colWidth1 + colWidth2 + colWidth3, yPosition - 3, colWidth4, rowHeight).stroke();
  });

  // Finalizar o documento
  doc.end();
};