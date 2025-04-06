const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('quiz', 'root', 'toor', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false // Disable SQL logs in console (optional)
});

module.exports = sequelize;