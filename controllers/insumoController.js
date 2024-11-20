const { TipoInsumo, Fornecedor, Insumo, Compra} = require("../models/post");
const { Op } = require('sequelize');
const db = require('../models'); 
const PDFDocument = require('pdfkit');
const path = require('path');

exports.renderizarInsumo = async function (req, res) {
  try {
    if (!req.session.userId) {
      return res.status(403).send('Usuário não autorizado');
    }

    // Buscar todos os insumos com o nome do TipoInsumo e Fornecedor incluídos
    const insumos = await Insumo.findAll({
      include: [
        {
          model: TipoInsumo,
          attributes: ['nome']  // Carregar o nome do TipoInsumo
        },
        {
          model: Fornecedor,
          attributes: ['nome']  // Carregar o nome do Fornecedor
        },
        {
          model: Compra,
          attributes: ['data_registro', 'valor_compra'],
          required: false
        }
      ]
    });

    // Buscar todos os tipos de insumo
    const tiposInsumo = await TipoInsumo.findAll();

    // Buscar todos os fornecedores
    const fornecedores = await Fornecedor.findAll();

    const compras = await Compra.findAll();

    // Converter os dados para JSON
    const insumosJson = insumos.map(insumo => insumo.toJSON());
    const tiposInsumoJson = tiposInsumo.map(tipo => tipo.toJSON());
    const fornecedoresJson = fornecedores.map(fornecedor => fornecedor.toJSON());
    const comprasJson = compras.map(compra => compra.toJSON());

    // Renderizar a página e enviar os dados
    res.render('insumo_pag', {
      insumos: insumosJson,
      tiposInsumo: tiposInsumoJson,
      fornecedores: fornecedoresJson,
      compras: comprasJson
    });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).send('Erro ao buscar dados.');
  }
};

exports.adicionarInsumo = async function (req, res) {
  try {
    const { tipoInsumo, fornecedor, validade, quantidade, novoTipo, novoFornecedorNome, novoFornecedorTelefone, data_compra, valor_compra } = req.body;

    // Verifica se o usuário está logado
    if (!req.session.userId) {
      return res.status(403).json({ message: 'Usuário não autorizado' });
    }

    // Verifica se o tipo de insumo já existe ou cria um novo
    let tipoInsumoId;
    if (tipoInsumo) {
      tipoInsumoId = tipoInsumo;
    } else if (novoTipo) {
      const [novoTipoInsumo] = await TipoInsumo.findOrCreate({
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

    // Cria a compra associada ao insumo, usando o id do novo insumo criado
    await Compra.create({
      fornecedorId: fornecedorId,
      insumoId: novoInsumo.id,  // Certifique-se de usar o id do novo insumo aqui
      valor_compra: valor_compra,
      data_registro: data_compra
    });

    // Redireciona para a página de insumos
    res.redirect('/insumos');
  } catch (error) {
    console.error('Erro ao cadastrar o insumo:', error);
    res.status(500).json({ message: 'Erro ao cadastrar o insumo' });
  }
};

exports.deletarInsumo = async function (req, res) {
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
};


exports.adicionarTipoInsumo = async function (req, res) {
  const { novoTipo } = req.body; // Obter o tipo de insumo do corpo da requisição
  try {
    // Tenta criar um novo tipo de insumo
    const tipoInsumo = await TipoInsumo.create({ nome: novoTipo });
    // Retorna o novo tipo de insumo em formato JSON
    res.status(201).json({ message: 'Tipo de insumo adicionado com sucesso!', tipoInsumo });
  } catch (error) {
    console.error('Erro ao adicionar tipo de insumo:', error);
    // Retorna uma mensagem de erro em caso de falha
    res.status(500).json({ message: 'Erro ao adicionar tipo de insumo' });
  }
};

exports.atualizarInsumo = async function (req, res) {
  const { insumoId, tipoInsumo, fornecedor, quantidade, validade } = req.body;

  // Log para verificar se os dados estão sendo recebidos corretamente
  console.log('InsumoId:', insumoId);
  console.log('TipoInsumo:', tipoInsumo);
  console.log('Fornecedor:', fornecedor);
  console.log('Quantidade:', quantidade);
  console.log('Validade:', validade);

  if (!insumoId) {
    return res.status(400).json({ message: 'Insumo ID não fornecido' });
  }

  try {
    // Atualiza o insumo no banco de dados
    await Insumo.update(
      {
        tipo_insumoId: tipoInsumo,  // ID do tipo de insumo
        fornecedorId: fornecedor,     // ID do fornecedor
        quantidade: quantidade,
        validade: new Date(validade), // Certifique-se de que a data está no formato correto
      },
      {
        where: { id: insumoId },      // Onde o insumo tem o ID igual ao fornecido
      }
    );

    res.redirect('/insumos');
  } catch (error) {
    console.error('Erro ao atualizar o insumo:', error);
    res.status(500).json({ message: 'Erro ao atualizar o insumo' });
  }
};

//Pesquisa insumos
exports.pesquisar = async (req, res) => {
  
  try {
  const { termo, campo } = req.query;  // Captura o termo de pesquisa e o campo selecionado
    // Condição de busca dinâmica
    let whereClause = {};
    if (campo === 'tipo_insumo') {
      whereClause['$tipo_insumo.nome$'] = { [Op.like]: `%${termo}%` };
    } else if (campo === 'fornecedor') {
      whereClause['$fornecedor.nome$'] = { [Op.like]: `%${termo}%` };
    } else if (campo === 'quantidade') {
      whereClause['quantidade'] = { [Op.like]: `%${termo}%` };
    }

    // Realizando a consulta no banco com a condição de filtro
    const insumos = await Insumo.findAll({
      where: whereClause,
      include: [
        { model: TipoInsumo, required: true },
        { model: Fornecedor, required: true },
        { model: Compra,
          attributes: ['data_registro', 'valor_compra'],
          required: false}
      ]
    });

    // Verifique se algum insumo foi encontrado
    if (insumos.length > 0) {
      // Passa os dados filtrados para a view
      res.render('insumo_pag', { insumos });
    } else {
      // Caso não haja resultados, renderize uma mensagem ou redirecione
      res.render('insumo_pag', { insumos: [], mensagem: 'Nenhum insumo encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar insumos:', error);
    res.status(500).send({ error: 'Erro ao buscar insumos' });
  }
};

exports.gerarRelatorioInsumos = (req, res) => { 
  const insumos = req.body.insumos; // Recebe os dados enviados
  const usuario = req.session.usuario;

  // Criar um novo documento PDF
  const doc = new PDFDocument({ size: 'A4', margin: 30 });
  
  // Definir o cabeçalho da resposta como PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=relatorio_insumos.pdf');

  const imagePath = path.join(__dirname, '../public/img/IMG-20240907-WA0006.jpg'); // Caminho absoluto para a imagem
  const imageTop = 30; // Posição fixa para a imagem
  const imageWidth = 100;
  const imageHeight = 100;
  doc.image(imagePath, imageTop, imageTop, { width: imageWidth, height: imageHeight });
  doc.y = imageTop + imageHeight;

  // Pipe o conteúdo do PDF para a resposta HTTP
  doc.pipe(res);

  // Adicionar título ao PDF
  doc.fontSize(18).text('Relatório de Estoque de Insumos', { align: 'center' });
  doc.moveDown();

  // Adicionar informações do usuário (nome, email e telefone)
  doc.fontSize(10).text(`Nome: ${usuario.nome}`, { align: 'left' });
  doc.text(`Email: ${usuario.email}`, { align: 'left' });
  doc.text(`Telefone: ${usuario.telefone_celular}`, { align: 'left' });
  doc.moveDown(); // Espaçamento antes de iniciar a tabela

  // Definir a largura das colunas
  const colWidth1 = 80;  // Tipo de Insumo
  const colWidth2 = 65;   // Quantidade
  const colWidth3 = 80;  // Fornecedor
  const colWidth4 = 80;  // Valor de Compra
  const colWidth5 = 120;  // Data de Compra
  const colWidth6 = 120;  // Validade

  // Definir a altura das linhas
  const rowHeight = 15;
  const tableTop = doc.y;

  // Cabeçalho da tabela
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Tipo de Insumo', 30, tableTop, { width: colWidth1, align: 'center' });
  doc.text('Quantidade', 30 + colWidth1, tableTop, { width: colWidth2, align: 'center' });
  doc.text('Fornecedor', 30 + colWidth1 + colWidth2, tableTop, { width: colWidth3, align: 'center' });
  doc.text('Valor de Compra', 30 + colWidth1 + colWidth2 + colWidth3, tableTop, { width: colWidth4, align: 'center' });
  doc.text('Data de Compra', 30 + colWidth1 + colWidth2 + colWidth3 + colWidth4, tableTop, { width: colWidth5, align: 'center' });
  doc.text('Validade', 30 + colWidth1 + colWidth2 + colWidth3 + colWidth4 + colWidth5, tableTop, { width: colWidth6, align: 'center' });

  // Criar uma linha abaixo do cabeçalho
  doc.lineWidth(1).moveTo(30, tableTop + rowHeight).lineTo(580, tableTop + rowHeight).stroke();
  doc.moveDown();

  // Adicionar os dados dos insumos
  insumos.forEach((insumo, index) => {
    const yPosition = tableTop + rowHeight * (index + 2); // Posição para cada linha

    // Verificar se há espaço para adicionar a linha, se não, ir para uma nova página
    if (yPosition > doc.page.height - 80) {
      doc.addPage(); // Adiciona uma nova página
    }

    doc.fontSize(10).font('Helvetica');
    doc.text(insumo.tipo_insumo, 30, yPosition, { width: colWidth1, align: 'center' });
    doc.text(insumo.quantidade.toString(), 30 + colWidth1, yPosition, { width: colWidth2, align: 'center' });
    doc.text(insumo.fornecedor, 30 + colWidth1 + colWidth2, yPosition, { width: colWidth3, align: 'center' });
    doc.text(insumo.valor_compra, 30 + colWidth1 + colWidth2 + colWidth3, yPosition, { width: colWidth4, align: 'center' });
    doc.text(insumo.data_compra, 30 + colWidth1 + colWidth2 + colWidth3 + colWidth4, yPosition, { width: colWidth5, align: 'center' });
    doc.text(insumo.validade, 30 + colWidth1 + colWidth2 + colWidth3 + colWidth4 + colWidth5, yPosition, { width: colWidth6, align: 'center' });

    // Adicionar bordas nas células
    doc.rect(30, yPosition - 3, colWidth1, rowHeight).stroke();
    doc.rect(30 + colWidth1, yPosition - 3, colWidth2, rowHeight).stroke();
    doc.rect(30 + colWidth1 + colWidth2, yPosition - 3, colWidth3, rowHeight).stroke();
    doc.rect(30 + colWidth1 + colWidth2 + colWidth3, yPosition - 3, colWidth4, rowHeight).stroke();
    doc.rect(30 + colWidth1 + colWidth2 + colWidth3 + colWidth4, yPosition - 3, colWidth5, rowHeight).stroke();
    doc.rect(30 + colWidth1 + colWidth2 + colWidth3 + colWidth4 + colWidth5, yPosition - 3, colWidth6, rowHeight).stroke();
  });

  // Finalizar o documento
  doc.end();
};
