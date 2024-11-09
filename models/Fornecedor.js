// models/Fornecedor.js
module.exports = (sequelize, DataTypes) => {
  const Fornecedor = sequelize.define('Fornecedor', {
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cnpj: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    enderecoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Endereco',
        key: 'id'
      }
    }
  }, {
    tableName: 'fornecedor'
  });

  Fornecedor.associate = function(models) {
    Fornecedor.belongsTo(models.Endereco, { foreignKey: 'enderecoId', as: 'endereco' });
  };

  return Fornecedor;
};


  