// models/Insumo.js
module.exports = (sequelize, DataTypes) => {
    const Insumo = sequelize.define('Insumo', {
      quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      validade: {
        type: DataTypes.DATE,
        allowNull: false,
      }
    });

    Insumo.associate = function(models) {
        Insumo.belongsTo(models.TipoInsumo, { foreignKey: 'tipo_insumoId' });
        Insumo.belongsTo(models.Fornecedor, { foreignKey: 'fornecedorId' });
      };
  
    return Insumo;
  };
  