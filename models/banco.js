const Sequelize = require("sequelize")
const sequelize = new Sequelize("PI", "root", "", {
    host: "localhost",
    dialect: "mysql"
})

module.exports = {
    Sequelize,
    sequelize
}