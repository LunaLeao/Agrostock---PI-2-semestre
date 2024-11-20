const { Colheita, TipoProduto, Venda } = require("../models/post");

exports.renderizarDashboard = async function (req, res) {
  try {
    // Verifica se o usuário está logado
    if (!req.session.userId) {
      return res.status(403).send('Usuário não autorizado');
    }

    // Buscar dados de colheitas
    const colheitas = await Colheita.findAll({
      attributes: ['nome_colheita', 'quantidade']
    });

    // Buscar dados de vendas, agora incluindo a colheita
    const vendas = await Venda.findAll({
      include: [{
        model: Colheita,
        attributes: ['nome_colheita'],  // Carregar o nome da colheita
      }],
      attributes: ['quantidade']
    });
    
    console.log("Vendas com Colheita Associada:", vendas);  // Adicione este log para depuração
    
    // Prepare os dados de vendas
    const nomesColheitasVendas = vendas.map(v => v.colheitum ? v.colheitum.nome_colheita : 'Sem colheita');
    const quantidadesVendas = vendas.map(v => v.quantidade);
    

    // Prepare os dados para o gráfico de colheitas
    const nomesColheitas = colheitas.map(c => c.nome_colheita);
    const quantidadesColheitas = colheitas.map(c => c.quantidade);

    // Log para depuração
    console.log("Nomes das Colheitas (Vendas):", nomesColheitasVendas);
    console.log("Quantidades das Vendas:", quantidadesVendas);

    // Renderize a página com os dados
    res.render('dashboard_pag', { 
        nomesColheitas: JSON.stringify(nomesColheitas),
        quantidadesColheitas: JSON.stringify(quantidadesColheitas),
        nomesColheitasVendas: JSON.stringify(nomesColheitasVendas),
        quantidadesVendas: JSON.stringify(quantidadesVendas)
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao obter dados de colheitas');
  }
};

exports.carregarGraficoColheita = async function (req, res) {
  try {
    if (!req.session.userId) {
      return res.status(403).send('Usuário não autorizado');
    }

    // Consulta para pegar a soma das quantidades de colheitas por mês
    const query = `
      SELECT
        MONTH(data_colheita) AS mes,
        SUM(quantidade) AS total_quantidade
      FROM colheita
      WHERE usuarioId = :userId
      GROUP BY MONTH(data_colheita)
      ORDER BY MONTH(data_colheita)
    `;

    const [rows] = await Colheita.sequelize.query(query, {
      replacements: { userId: req.session.userId },
    });

    // Organiza os dados para o gráfico
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Extraímos os meses e as quantidades
    const nomesMeses = rows.map(row => meses[row.mes - 1]); // O mês é retornado como número (1-12)
    const quantidades = rows.map(row => row.total_quantidade);

    // Envia os dados para o frontend
    res.json({ nomesMeses, quantidades });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar dados para o gráfico.');
  }
};


