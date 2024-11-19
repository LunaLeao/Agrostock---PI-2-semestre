module.exports = (sequelize, DataTypes) => {
    const Colheita = sequelize.define('Colheita', {
        nome_colheita: { 
            type: DataTypes.STRING,
            allowNull: false
        },
        tipo_colheitaId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'TipoColheita',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        tipo_produtoId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'TipoProduto',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        quantidade: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        data_colheita: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'Colheita'
    });


    return Colheita;
};


