const db = require("./banco")
const models = require('./');

const Endereco = db.sequelize.define("endereco", {
    bairro: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    nome_rua: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    numero: {
        type: db.Sequelize.INTEGER,
        allowNull: false
    },
    cep: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    nome_propriedade:{
        type: db.Sequelize.STRING
    },
    complemento:{
        type: db.Sequelize.STRING
    },
    cidade:{
        type: db.Sequelize.STRING
    },
    uf: {
        type: db.Sequelize.STRING
    }
}, {
    tableName: 'Endereco'
})

const Usuario = db.sequelize.define("usuario", {
    nome: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    foto_perfil: {
        type: db.Sequelize.STRING,
        defaultValue: '/uploads/profile.png' 
      },
    email: {
        type: db.Sequelize.STRING,
        unique: true
    },
    senha: {
        type: db.Sequelize.STRING
    },
    telefone_celular: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    telefone_residencial: {
        type: db.Sequelize.STRING
    },
    cpf:{
        type: db.Sequelize.STRING,
        unique: true
    },
    enderecoId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: 'Endereco',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    tipo_usuario: {
        type: db.Sequelize.ENUM('usuario','administrador'),
        defaultValue: 'usuario'
    }
},{
    tableName: 'Usuários'
});

const TipoProduto = db.sequelize.define("tipo_produto",{
    nome: {
        type: db.Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'TipoProduto'
})

const Colheita = db.sequelize.define("colheita", {
    nome_colheita: { 
        type: db.Sequelize.STRING,
        allowNull: false
    },
    tipo_produtoId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: 'TipoProduto',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    usuarioId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: 'Usuários',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    quantidade: {
        type: db.Sequelize.INTEGER,
        allowNull: false
    },
    tipo_insumoId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: 'TipoInsumo',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    data_colheita: {
        type: db.Sequelize.DATE,
        allowNull: false
    }
}, {
    tableName: 'Colheita'
})

const TipoInsumo = db.sequelize.define("tipo_insumo",{
    nome: {
        type: db.Sequelize.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'TipoInsumo'
})

const EstoqueColheita = db.sequelize.define("estoque_colheita",{
    colheitaId: {
        type: db.Sequelize.INTEGER,
        references:{
            model: 'Colheita',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    quantidade_atual: {
        type: db.Sequelize.INTEGER,
        allowNull: false
    },
    data_atualizacao: {
        type: db.Sequelize.DATE,
        allowNull: false
    }
}, {
    tableName: 'EstoqueColheita'
})

const Comprador = db.sequelize.define("comprador",{
    nome: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    telefone: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: db.Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    enderecoId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: 'Endereco',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'Comprador'
})

const Fornecedor = db.sequelize.define("fornecedor",{
    nome: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    telefone: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    cnpj: {
        type: db.Sequelize.STRING
    },
    enderecoId: { 
        type: db.Sequelize.INTEGER,
        allowNull: true, 
        references: {
            model: 'Endereco', 
            key: 'id' 
        }
    }
}, {
    tableName: 'Fornecedor'
})

const Insumo = db.sequelize.define("insumo",{
    tipo_insumoId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: 'TipoInsumo',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    quantidade: {
        type: db.Sequelize.INTEGER,
        allowNull: false
    },
    validade: {
        type: db.Sequelize.DATE,
        allowNull: false,
    },
    fornecedorId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: 'Fornecedor',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'Insumo'
})

const EstoqueInsumo = db.sequelize.define("estoque_insumo",{
    data_atualizacao: {
        type: db.Sequelize.DATE,
        allowNull: false
    },
    quantidade_atual: {
        type: db.Sequelize.INTEGER,
        allowNull: false
    },
    insumoId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: 'Insumo',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'EstoqueInsumo'
})

const Venda = db.sequelize.define("venda",{
    tipo_produtoId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: 'TipoProduto',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    colheitaId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: 'Colheita',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    compradorId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: 'Comprador',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    usuarioId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: 'Usuários',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    quantidade: {
        type: db.Sequelize.INTEGER,
        allowNull: false
    },
    valor_total: {
        type: db.Sequelize.DOUBLE,
        allowNull: false
    },
    data_venda: {
        type: db.Sequelize.DATE,
        allowNull: false
    }
}, {
    tableName: 'Venda'
})

const TipoRelatorio = db.sequelize.define("tipo_relatorio",{
    descricao: {
        type: db.Sequelize.STRING,
        allowNull: false,
    }
}, {
    tableName: 'TipoRelatorio'
})

const Relatorios = db.sequelize.define("relatorios",{
    data_geracao: {
        type: db.Sequelize.DATE,
        allowNull: false
    },
    tipoRelatorioId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: 'TipoRelatorio',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'Relatorios'
})

const Cotacao = db.sequelize.define("cotacao",{
    valor_cotacao: {
        type: db.Sequelize.DOUBLE,
        allowNull: false
    },
    data_cotacao: {
        type: db.Sequelize.DATE,
        allowNull: false
    },
    tipo_produtoId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: 'TipoProduto',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'Cotacao'
})

const CalculoLucro = db.sequelize.define("calculo_lucro",{
    valor_venda: {
        type: db.Sequelize.DOUBLE,
        allowNull: false
    },
    custos_fixos: {
        type: db.Sequelize.DOUBLE,
        allowNull: false
    },
    custos_variaveis: {
        type: db.Sequelize.DOUBLE
    },
    lucro_calculado: {
        type: db.Sequelize.DOUBLE,
        allowNull: false
    },
    vendaId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: 'Venda',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'CalculoLucro'
})

const Compra = db.sequelize.define("compra", {
    fornecedorId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: 'Fornecedor',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    insumoId: {
        type: db.Sequelize.INTEGER,
        references: {
          model: 'Insumo',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    valor_compra: {
        type: db.Sequelize.FLOAT,
        allowNull: false
    },
    data_registro: {
        type: db.Sequelize.DATE,
        allowNull: false,
        defaultValue: db.Sequelize.NOW
    }
}, {
    tableName: 'Compra'
});


Usuario.hasMany(Colheita, {foreignKey: 'usuarioId'});
Colheita.belongsTo(Usuario, {foreignKey: 'usuarioId'});

Usuario.belongsTo(Endereco, { foreignKey: 'enderecoId' });
Endereco.hasMany(Usuario, { foreignKey: 'enderecoId' });

Endereco.hasMany(Comprador, { foreignKey: 'enderecoId'});
Comprador.belongsTo(Endereco, { foreignKey: 'enderecoId'});

TipoProduto.hasMany(Fornecedor, { foreignKey: 'tipo_produtoId'});
Fornecedor.belongsTo(TipoProduto, { foreignKey: 'tipo_produtoId'});

Fornecedor.hasMany(Insumo, { foreignKey: 'fornecedorId'});
Insumo.belongsTo(Fornecedor, { foreignKey: 'fornecedorId'});

TipoInsumo.hasMany(Insumo, { foreignKey: 'tipo_insumoId'});
Insumo.belongsTo(TipoInsumo, { foreignKey: 'tipo_insumoId'});

Fornecedor.hasMany(Compra, {foreignKey: 'fornecedorId'});
Compra.belongsTo(Fornecedor, {foreignKey: 'fornecedorId'});

Insumo.hasMany(Compra, { foreignKey: 'insumoId' });
Compra.belongsTo(Insumo, { foreignKey: 'insumoId' });

Fornecedor.belongsTo(Endereco, {foreignKey:'enderecoId'});
Endereco.hasMany(Fornecedor, {foreignKey: 'enderecoId'});

Insumo.hasMany(EstoqueInsumo, { foreignKey: 'insumoId'});
EstoqueInsumo.belongsTo(Insumo, { foreignKey: 'insumoId'});

Comprador.hasMany(Venda, { foreignKey: 'compradorId'});
Venda.belongsTo(Comprador, { foreignKey: 'compradorId'});

Usuario.hasMany(Venda, { foreignKey: 'usuarioId'});
Venda.belongsTo(Usuario, { foreignKey: 'usuarioId'});

TipoProduto.hasMany(Venda, { foreignKey: 'tipo_produtoId'});
Venda.belongsTo(TipoProduto, { foreignKey: 'tipo_produtoId'});

TipoInsumo.hasMany(Colheita, { foreignKey: 'tipo_insumoId'});
Colheita.belongsTo(TipoInsumo, { foreignKey: 'tipo_insumoId'});

TipoRelatorio.hasMany(Relatorios, { foreignKey: 'tipoRelatorioId'});
Relatorios.belongsTo(TipoRelatorio, { foreignKey: 'tipoRelatorioId'});

TipoProduto.hasMany(Cotacao, { foreignKey: 'tipo_produtoId'});
Cotacao.belongsTo(TipoProduto, { foreignKey: 'tipo_produtoId'});

Venda.hasMany(CalculoLucro, { foreignKey: 'vendaId'});
CalculoLucro.belongsTo(Venda, { foreignKey: 'vendaId'});

TipoProduto.hasMany(Colheita, {foreignKey: 'tipo_produtoId'});
Colheita.belongsTo(TipoProduto, {foreignKey: 'tipo_produtoId'})

Colheita.hasMany(EstoqueColheita, { foreignKey: 'colheitaId'});
EstoqueColheita.belongsTo(Colheita, { foreignKey: 'colheitaId'});

Venda.belongsTo(Colheita, { foreignKey: 'colheitaId' });
Colheita.hasMany(Venda, { foreignKey: 'colheitaId' });


module.exports = {Usuario,TipoProduto,Colheita,Endereco,TipoInsumo,TipoRelatorio,Relatorios,CalculoLucro,Comprador,Cotacao,EstoqueColheita,EstoqueInsumo,Venda,Fornecedor,Insumo,Compra};

//db.sequelize.sync ({force: true}) //mudar pra alter no lugar de force caso queira atualizar apenas
//db.sequelize.sync({ alter: true })
