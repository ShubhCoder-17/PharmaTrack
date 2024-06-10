const sequelize = require('./models/index.cjs');
const User = require('./models/user.cjs');

async function syncModels() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    await sequelize.sync({ force: true }); // This will drop and recreate tables
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to synchronize the models:', error);
  }
}

syncModels();


