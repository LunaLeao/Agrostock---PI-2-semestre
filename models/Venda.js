module.exports = (sequelize, DataTypes) => {
    const Venda = sequelize.define('Venda', {
        tipo_produtoId: {
          type: DataTypes.INTEGER,
          references: {
            model: 'TipoProduto',
            key: 'id'
          }
        },
        compradorId: {
          type: DataTypes.INTEGER,
          references: {
            model: 'Comprador',
            key: 'id'
          }
        },
        quantidade: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        valor_total: {
          type: DataTypes.DOUBLE,
          allowNull: false
        },
        data_venda: {
          type: DataTypes.DATE,
          allowNull: false
        }
    }, {
        tableName: 'Venda'
    });

  
    return Venda;
};
