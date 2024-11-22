const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    foto_perfil: {
      type: DataTypes.STRING,
      defaultValue: '/uploads/profile.png', // Caminho padrão para imagem
    },
  });
  
  module.exports = Usuario;