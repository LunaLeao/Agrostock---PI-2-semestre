const { Colheita, TipoProduto } = require("../models/post");

exports.renderizarDashboard = async function (req, res) {
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

    res.render('dashboard_pag', { colheitas: colheitasJson, tiposProduto });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar dados.');
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


