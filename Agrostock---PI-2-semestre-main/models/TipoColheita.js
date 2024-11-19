// models/TipoColheita.js
module.exports = (sequelize, DataTypes) => {
    const TipoColheita = sequelize.define('TipoColheita', {
        nome: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: 'tipo_colheita' // Nome da tabela no banco de dados
    });

    TipoColheita.associate = function(models) {
        TipoColheita.hasMany(models.Colheita, { foreignKey: 'tipo_colheitaId' });
    };

    return TipoColheita;
};

