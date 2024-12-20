const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://user:pass@localhost:8082/PI');
const db = {};

// Importa os modelos
const TipoInsumo = require('./TipoInsumo')(sequelize, DataTypes);
const Fornecedor = require('./Fornecedor')(sequelize, DataTypes);
const Insumo = require('./Insumo')(sequelize, DataTypes);
const Colheita = require('./Colheita')(sequelize, DataTypes);
const TipoColheita = require('./TipoColheita')(sequelize, DataTypes);
const TipoProduto = require('./TipoProduto')(sequelize, DataTypes);
const Comprador = require('./Comprador')(sequelize, DataTypes);
const Venda = require('./Venda')(sequelize, DataTypes);
const Endereco = require('./Endereco')(sequelize, DataTypes);

// Configura os relacionamentos
TipoInsumo.hasMany(Insumo, { foreignKey: 'tipo_insumoId' });
Fornecedor.hasMany(Insumo, { foreignKey: 'fornecedorId' });
Insumo.belongsTo(TipoInsumo, { foreignKey: 'tipo_insumoId' });
Insumo.belongsTo(Fornecedor, { foreignKey: 'fornecedorId' });

TipoProduto.hasMany(Colheita, { foreignKey: 'tipo_produtoId', as: 'Colheitas' });
Colheita.belongsTo(TipoProduto, { foreignKey: 'tipo_produtoId', as: 'tipo_produto' });

Venda.belongsTo(Comprador, { foreignKey: 'compradorId' });

module.exports = { 
    TipoInsumo, 
    Fornecedor, 
    Insumo, 
    Colheita, 
    TipoColheita, 
    TipoProduto, 
    Comprador, 
    Endereco,
    Venda,
    sequelize, 
    Sequelize,
    db
};




