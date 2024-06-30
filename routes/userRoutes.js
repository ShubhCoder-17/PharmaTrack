const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserSequelize = require('../models/userSequelize');
const UserMongoose = require('../models/userMongoose');
const router = express.Router();

// User registration route (MySQL)
router.post('/register', async (req, res) => {
  const { username, password, name, email } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserSequelize.create({ username, password: hashedPassword, name, email });
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        message: err.message,
        type: err.type,
        field: err.path
      }));
      return res.status(400).json({ message: 'Validation error', errors });
    }
    console.error('User registration error:', error);
    res.status(500).json({ message: 'User registration failed', error: error.message });
  }
});

// User login route (MySQL)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserSequelize.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Failed to login', error: error.message });
  }
});

// Example of a route using Mongoose for MongoDB operations
router.post('/mongodb-register', async (req, res) => {
  const { username, password, name, email } = req.body;
  try {
    const newUser = new UserMongoose({ username, password, name, email });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ message: 'User registration failed', error: error.message });
  }
});

router.post('/mongodb-login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserMongoose.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await user.isValidPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Failed to login', error: error.message });
  }
});

module.exports = router;
