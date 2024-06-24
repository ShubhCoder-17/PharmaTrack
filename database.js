const { Sequelize } = require('sequelize');
const config = require('./config/config.json');

const env = process.env.NODE_ENV || 'development';
const { username, password, database, host, dialect, port } = config[env];

const sequelize = new Sequelize(database, username, password, {
  host,
  dialect,
  port
});

module.exports = sequelize;
