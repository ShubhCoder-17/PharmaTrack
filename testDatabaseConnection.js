const sequelize = require('./database');

sequelize.authenticate()
  .then(() => {
    console.log('MySQL database connected successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('MySQL database connection error:', err);
    process.exit(1);
  });
