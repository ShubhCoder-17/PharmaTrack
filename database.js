const { Sequelize } = require('sequelize');
const config = require('./config.json');

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect, // Ensure the dialect is explicitly provided
  port: dbConfig.port
});

module.exports = sequelize;
