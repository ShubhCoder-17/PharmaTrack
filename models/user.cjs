// models/user.cjs
const { DataTypes } = require('sequelize');
const sequelize = require('./index.cjs'); // Ensure the correct path

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'users', // Name of the table in the database
  timestamps: false, // Disable timestamps if not used
});

module.exports = User;