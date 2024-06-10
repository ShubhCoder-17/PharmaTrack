// const { Sequelize } = require('sequelize');
// const config = require('../config/config.json'); // Ensure this path is correct
// const env = process.env.NODE_ENV || 'development';
// const dbConfig = config[env];

// // Initialize Sequelize with the configuration
// const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
//   host: dbConfig.host,
//   dialect: dbConfig.dialect,
//   logging: false, // Optional: disable logging
//   port: dbConfig.port || 3306, // Ensure this matches your MySQL configuration
// });

// async function testConnection() {
//   try {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
// }

// testConnection();

// module.exports = sequelize;



// models/index.cjs
const { Sequelize } = require('sequelize');
const config = require('../config/config.json');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  logging: false, // Optional: disable logging
  port: dbConfig.port || 33060, // Ensure this matches your MySQL configuration
});    

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

module.exports = sequelize;

