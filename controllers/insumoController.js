const { TipoInsumo, Fornecedor, Insumo } = require("../models/post");

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
        }
      ]
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
    res.render('insumo_pag', {
      insumos: insumosJson,
      tiposInsumo: tiposInsumoJson,
      fornecedores: fornecedoresJson
    });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).send('Erro ao buscar dados.');
  }
};

exports.adicionarInsumo = async function (req, res) {
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
