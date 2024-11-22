// models/Endereco.js
module.exports = (sequelize, DataTypes) => {
    const Endereco = sequelize.define('Endereco', {
      rua: {
        type: DataTypes.STRING,
        allowNull: false
      },
      cidade: {
        type: DataTypes.STRING,
        allowNull: false
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      tableName: 'endereco'
    });
  
    Endereco.associate = function(models) {
      Endereco.hasMany(models.Fornecedor, { foreignKey: 'enderecoId' });
    };
  
    return Endereco;
  };
  