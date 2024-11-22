const Sequelize = require("sequelize")
const sequelize = new Sequelize("PI", "root", "", {
    host: "localhost",
    dialect: "mysql",
    // dialectOptions: {
    //     connectTimeout: 10000,
    // },
})

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;

const Insumo = require('./post');

module.exports = {
    Sequelize,
    sequelize
}