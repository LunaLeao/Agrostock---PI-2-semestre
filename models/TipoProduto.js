// models/TipoProduto.js
module.exports = (sequelize, DataTypes) => {
    const TipoProduto = sequelize.define('TipoProduto', {
        nome: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: 'tipo_produto' // Nome da tabela no banco de dados
    });

    TipoProduto.associate = function(models) {
        TipoProduto.hasMany(models.Colheita, { foreignKey: 'tipo_produtoId' });
    };

    return TipoProduto;
};

