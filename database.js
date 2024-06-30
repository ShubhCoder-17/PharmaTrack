const { Sequelize } = require('sequelize');
const config = require('./config/config.json');
const winston = require('winston');

const env = process.env.NODE_ENV || 'development';
const { username, password, database, host, dialect, port } = config[env];

const sequelize = new Sequelize(database, username, password, {
  host,
  dialect,
  port,
  logging: (msg) => console.log(msg) // Log SQL queries to console
});

sequelize.authenticate()
  .then(() => {
    console.log('MySQL database connected');
  })
  .catch(err => {
    winston.error('MySQL database connection error:', err);
    console.error('MySQL database connection error:', err);
  });

module.exports = sequelize;
