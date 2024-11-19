// models/Comprador.js
module.exports = (sequelize, DataTypes) => {
    const Comprador = sequelize.define('Comprador', {
        nome: {
            type: DataTypes.STRING,
            allowNull: false
        },
        telefone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true
        },
        enderecoId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'Comprador'
    });

    Comprador.associate = (models) => {
        Comprador.hasMany(models.Venda, { foreignKey: 'compradorId' });
    };

    return Comprador;
};

