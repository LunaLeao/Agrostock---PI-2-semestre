const{Venda, Comprador, Colheita} = require("../models/post");
const { Op } = require('sequelize');
const db = require('../models'); 
const PDFDocument = require('pdfkit');
const path = require('path');

// exports.gerarRelatorioVendas = (req, res) => { 
//   const vendas = req.body.vendas; // Recebe os dados das vendas do front-end
//   const usuario = req.session.usuario; // Informações do usuário logado

//   // Criar um novo documento PDF
//   const doc = new PDFDocument({ size: 'A4', margin: 30 });
  
//   // Definir o cabeçalho da resposta como PDF
//   res.setHeader('Content-Type', 'application/pdf');
//   res.setHeader('Content-Disposition', 'inline; filename=relatorio_vendas.pdf');

//   // Caminho para o logotipo ou imagem
//   const imagePath = path.join(__dirname, '../public/img/IMG-20240907-WA0006.jpg');
//   doc.image(imagePath, 30, 30, { width: 100, height: 100 });

//   // Espaçamento para o cabeçalho
//   const headerSpacing = 140;

//   // Garantir que o conteúdo comece após a imagem
//   doc.y = headerSpacing;

//   // Título
//   doc.fontSize(18).text('Relatório de Vendas', { align: 'center' });
//   doc.moveDown();

//   // Informações do usuário
//   doc.fontSize(10).text(`Gerado por: ${usuario.nome}`, { align: 'left' });
//   doc.text(`Email: ${usuario.email}`, { align: 'left' });
//   doc.text(`Telefone: ${usuario.telefone_celular}`, { align: 'left' });
//   doc.moveDown();

//   // Cabeçalho da tabela
//   const colWidths = [100, 100, 70, 100, 100]; // Larguras das colunas
//   const tableTop = doc.y;

//   doc.fontSize(10).font('Helvetica-Bold');
//   doc.text('Cliente', 30, tableTop, { width: colWidths[0], align: 'center' });
//   doc.text('Produto', 30 + colWidths[0], tableTop, { width: colWidths[1], align: 'center' });
//   doc.text('Quantidade', 30 + colWidths[0] + colWidths[1], tableTop, { width: colWidths[2], align: 'center' });
//   doc.text('Valor da Venda', 30 + colWidths[0] + colWidths[1] + colWidths[2], tableTop, { width: colWidths[3], align: 'center' });
//   doc.text('Data da Venda', 30 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop, { width: colWidths[4], align: 'center' });

//   // Linha abaixo do cabeçalho
//   doc.lineWidth(1).moveTo(30, tableTop + 15).lineTo(580, tableTop + 15).stroke();

//   // Adicionar os dados das vendas
//   vendas.forEach((venda, index) => {
//     const yPosition = tableTop + 20 * (index + 2);

//     // Adicionar nova página, se necessário
//     if (yPosition > doc.page.height - 60) {
//       doc.addPage();
//       doc.y = 50;
//     }

//     doc.fontSize(10).font('Helvetica');
//     doc.text(venda.cliente, 30, yPosition, { width: colWidths[0], align: 'center' });
//     doc.text(venda.produto, 30 + colWidths[0], yPosition, { width: colWidths[1], align: 'center' });
//     doc.text(venda.quantidade.toString(), 30 + colWidths[0] + colWidths[1], yPosition, { width: colWidths[2], align: 'center' });
//     doc.text(venda.valor_venda, 30 + colWidths[0] + colWidths[1] + colWidths[2], yPosition, { width: colWidths[3], align: 'center' });
//     doc.text(venda.data_venda, 30 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPosition, { width: colWidths[4], align: 'center' });
//   });

//   // Finalizar o documento
//   doc.end();
// };

exports.gerarRelatorioVendas = (req, res) => {
  const vendas = req.body.vendas; // Recebe os dados das vendas
  const usuario = req.session.usuario;

  // Criar um novo documento PDF
  const doc = new PDFDocument({ size: 'A4', margin: 30 });
  
  // Definir o cabeçalho da resposta como PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=relatorio_vendas.pdf');

  const imagePath = path.join(__dirname, '../public/img/IMG-20240907-WA0006.jpg'); // Caminho da imagem
  const imageTop = 30; // Posição fixa para a imagem
  const imageWidth = 100;
  const imageHeight = 100;
  doc.image(imagePath, imageTop, imageTop, { width: imageWidth, height: imageHeight });
  doc.y = imageTop + imageHeight;

  // Pipe o conteúdo do PDF para a resposta HTTP
  doc.pipe(res);

  // Adicionar título ao PDF
  doc.fontSize(18).text('Relatório de Vendas', { align: 'center' });
  doc.moveDown();

  // Adicionar informações do usuário (nome, email e telefone)
  doc.fontSize(10).text(`Nome: ${usuario.nome}`, { align: 'left' });
  doc.text(`Email: ${usuario.email}`, { align: 'left' });
  doc.text(`Telefone: ${usuario.telefone_celular}`, { align: 'left' });
  doc.moveDown(); // Espaçamento antes de iniciar a tabela

  // Definir a largura das colunas
  const colWidth1 = 120;  // Cliente
  const colWidth2 = 120;  // Produto
  const colWidth3 = 80;   // Quantidade
  const colWidth4 = 80;   // Valor de Venda
  const colWidth5 = 140;  // Data de Venda

  // Definir a altura das linhas
  const rowHeight = 15;
  const tableTop = doc.y;

  // Cabeçalho da tabela
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Cliente', 30, tableTop, { width: colWidth1, align: 'center' });
  doc.text('Produto', 30 + colWidth1, tableTop, { width: colWidth2, align: 'center' });
  doc.text('Quantidade', 30 + colWidth1 + colWidth2, tableTop, { width: colWidth3, align: 'center' });
  doc.text('Valor Venda', 30 + colWidth1 + colWidth2 + colWidth3, tableTop, { width: colWidth4, align: 'center' });
  doc.text('Data Venda', 30 + colWidth1 + colWidth2 + colWidth3 + colWidth4, tableTop, { width: colWidth5, align: 'center' });

  // Criar uma linha abaixo do cabeçalho
  doc.lineWidth(1).moveTo(30, tableTop + rowHeight).lineTo(580, tableTop + rowHeight).stroke();
  doc.moveDown();

  // Adicionar os dados das vendas
  vendas.forEach((venda, index) => {
    const yPosition = tableTop + rowHeight * (index + 2); // Posição para cada linha

    // Verificar se há espaço para adicionar a linha, se não, ir para uma nova página
    if (yPosition > doc.page.height - 80) {
      doc.addPage(); // Adiciona uma nova página
    }

    doc.fontSize(10).font('Helvetica');
    doc.text(venda.cliente || 'N/A', 30, yPosition, { width: colWidth1, align: 'center' });
    doc.text(venda.produto || 'N/A', 30 + colWidth1, yPosition, { width: colWidth2, align: 'center' });
    doc.text(venda.quantidade.toString() || 'N/A', 30 + colWidth1 + colWidth2, yPosition, { width: colWidth3, align: 'center' });
    doc.text(venda.valor_venda || 'N/A', 30 + colWidth1 + colWidth2 + colWidth3, yPosition, { width: colWidth4, align: 'center' });
    doc.text(venda.data_venda || 'N/A', 30 + colWidth1 + colWidth2 + colWidth3 + colWidth4, yPosition, { width: colWidth5, align: 'center' });

    // Adicionar bordas nas células
    doc.rect(30, yPosition - 3, colWidth1, rowHeight).stroke();
    doc.rect(30 + colWidth1, yPosition - 3, colWidth2, rowHeight).stroke();
    doc.rect(30 + colWidth1 + colWidth2, yPosition - 3, colWidth3, rowHeight).stroke();
    doc.rect(30 + colWidth1 + colWidth2 + colWidth3, yPosition - 3, colWidth4, rowHeight).stroke();
    doc.rect(30 + colWidth1 + colWidth2 + colWidth3 + colWidth4, yPosition - 3, colWidth5, rowHeight).stroke();
  });

  // Finalizar o documento
  doc.end();
};

// Função para renderizar vendas
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
        { 
          model: Colheita,
          attributes: ['nome_colheita']
        }, // Incluindo Colheita
        { model: Comprador } // Inclui o modelo de Comprador
      ],
    });

    // Busca todos os compradores e colheitas
    const compradores = await Comprador.findAll();
    const colheitas = await Colheita.findAll(); // Busca as colheitas disponíveis

    const vendasJson = vendas.map(venda => venda.toJSON());

    // Renderiza a página passando as vendas, compradores e colheitas
    res.render('venda_pag', { 
      vendas: vendasJson,
      compradores,
      colheitas, // Agora estamos passando as colheitas
      isVendasPage: true,  
      isFornecedoresPage: false 
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar vendas.');
  }
};

// Função para cadastrar uma nova venda
exports.cadastrarVenda = async function (req, res) {
  try {
    // Extrai os dados do corpo da requisição
    const { compradorId, nome_colheita, valor_total, quantidade, data_venda, observacao } = req.body;

    // Verifica se o usuário está logado
    if (!req.session.userId) {
      return res.status(403).json({ message: 'Usuário não autorizado' });
    }

    // Verifica se o compradorId foi fornecido
    if (!compradorId) {
      return res.status(400).json({ message: 'ID do comprador é obrigatório.' });
    }

    // Verifica se o nome da colheita foi fornecido
    if (!nome_colheita) {
      return res.status(400).json({ message: 'Nome da colheita é obrigatório.' });
    }

    // Busca o ID da colheita com base no nome
    const colheita = await Colheita.findOne({
      where: { nome_colheita: nome_colheita }
    });

    if (!colheita) {
      return res.status(400).json({ message: 'Colheita não encontrada.' });
    }

    // Cria a nova venda usando o colheitaId
    const novaVenda = await Venda.create({
      compradorId: compradorId,
      colheitaId: colheita.id, // Usando o ID da colheita encontrada
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
    const { vendaId, compradorId, quantidade, valor_total, colheitaId, data_venda } = req.body;
  
    try {
      await Venda.update(
        {
          compradorId: compradorId,
          quantidade: quantidade,
          valor_total,
          colheitaId: colheitaId,
          data_venda: new Date(data_venda),
        },
        {
          where: { id: vendaId },
        }
      );
  0
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

  //Pesquisar vendas
exports.pesquisarVenda = async (req, res) => {
    try {
        const { termo, campo } = req.query;
        let whereClause = {};

        if (campo === 'compradorId') {
            whereClause['$comprador.nome$'] = { [Op.like]: `%${termo}%` };
        } else if (campo === 'tipo_produto') {
            whereClause['$colheita.nome_colheita$'] = { [Op.like]: `%${termo}%` };
        } else if (campo === 'quantidade') {
            whereClause['quantidade'] = { [Op.like]: `%${termo}%` };
        }

        const vendas = await Venda.findAll({
            where: whereClause,
            include: [
                { model: Comprador, required: true },
                { model: Colheita, as: 'colheita', required: true}
            ]
        });

        if (vendas.length > 0) {
            res.render('venda_pag', { vendas });
        } else {
            res.render('venda_pag', { vendas: [], mensagem: 'Nenhuma venda encontrada' });
        }
    } catch (error) {
        console.error('Erro ao buscar vendas:', error);
        res.status(500).send({ error: 'Erro ao buscar vendas' });
    }
};