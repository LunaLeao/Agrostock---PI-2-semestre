// models/TipoInsumo.js
module.exports = (sequelize, DataTypes) => {
    const TipoInsumo = sequelize.define('TipoInsumo', {
      nome: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      tableName: 'tipo_insumo' // Nome da tabela no banco de dados
    });
  
    TipoInsumo.associate = function(models) {
      TipoInsumo.hasMany(models.Insumo, {
        foreignKey: 'tipo_insumoId'
      });
    };
  
    return TipoInsumo;
  };