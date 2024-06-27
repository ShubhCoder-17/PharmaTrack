// app.js or server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const winston = require('winston');
const { Sequelize } = require('sequelize');
const User = require('./models/user.cjs'); // Adjust the path as needed
const authenticateToken = require('./middleware/authenticateToken');
const { validateUserRegistration } = require('./validators'); // Adjust the path as needed
const BlacklistedToken = require('./models/BlacklistedToken'); // MongoDB Model for Blacklisted Tokens
const passwordResetRouter = require('./routes/passwordReset'); // Import the password reset routes

const app = express();
app.use(bodyParser.json());

// Configure winston to log to a file
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// MongoDB connection for blacklisting tokens
mongoose.connect('mongodb://localhost:27017/your-database-name', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// MySQL connection using Sequelize
const sequelize = new Sequelize('pharmadb', 'root', 'Shubh@1705', {
  host: '127.0.0.1',
  dialect: 'mysql',
  port: 33060
});

// Sync MySQL database
sequelize.sync()
  .then(() => {
    console.log('MySQL database connected and synchronized');
  })
  .catch(err => {
    logger.error('MySQL database connection failed:', err);
    console.error('MySQL database connection failed:', err);
  });

// Routes
app.use('/password-reset', passwordResetRouter); // Add password reset routes

// User registration route
app.post('/register', validateUserRegistration, async (req, res) => {
  const { username, password, name, email } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword, name, email });
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
    logger.error('User registration error:', {
      message: error.message,
      stack: error.stack,
      input: req.body
    });
    console.error('User registration error:', error);
    res.status(500).json({ message: 'User registration failed', error: error.message });
  }
});

// User login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Password is invalid');
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    logger.error('Login error:', {
      message: error.message,
      stack: error.stack,
      input: req.body
    });
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Logout route
app.post('/logout', authenticateToken, async (req, res) => {
  const token = req.headers['authorization'].split(' ')[1];
  const decodedToken = jwt.decode(token);
  const expiresAt = new Date(decodedToken.exp * 1000);

  // Save the blacklisted token
  const blacklistedToken = new BlacklistedToken({ token, expiresAt });
  await blacklistedToken.save();

  res.json({ message: 'Logged out successfully' });
});

// Protected route
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Fetch User Details
app.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    logger.error('Fetch user details error:', {
      message: error.message,
      stack: error.stack,
      userId: req.params.id
    });
    res.status(500).json({ error: error.message });
  }
});

// Update User Information
app.put('/users/:id', authenticateToken, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json(user);
  } catch (error) {
    logger.error('Update user information error:', {
      message: error.message,
      stack: error.stack,
      userId: req.params.id,
      input: req.body
    });
    res.status(500).json({ error: error.message });
  }
});

// Delete User
app.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Delete user error:', {
      message: error.message,
      stack: error.stack,
      userId: req.params.id
    });
    res.status(500).json({ error: error.message });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to PharmaTrack, Hope this App will Help you!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
