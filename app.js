const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./database'); // Adjust the path as per your project structure
const User = require('./models/user.cjs'); // Adjust the path as per your project structure
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const winston = require('winston');
const BlacklistedToken = require('./models/BlacklistedToken'); // MongoDB Model for Blacklisted Tokens
const passwordResetRouter = require('./routes/passwordReset'); // Import the password reset routes
const authenticateToken = require('./middleware/authenticateToken'); // Import the authenticateToken middleware

const app = express();
const PORT = process.env.PORT || 3000;

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
sequelize.authenticate()
  .then(() => {
    console.log('MySQL database connected');
  })
  .catch(err => {
    logger.error('MySQL database connection error:', err);
    console.error('MySQL database connection error:', err);
  });

// Sync MySQL database
sequelize.sync()
  .then(() => {
    console.log('MySQL database synchronized');
  })
  .catch(err => {
    logger.error('MySQL database synchronization error:', err);
    console.error('MySQL database synchronization error:', err);
  });

// Routes
app.use('/password-reset', passwordResetRouter); // Add password reset routes

// User registration route
app.post('/register', async (req, res) => {
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
// Protected route
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Fetch User Details
app.get('/users/:id', async (req, res) => {
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
app.put('/users/:id', async (req, res) => {
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
app.delete('/users/:id', async (req, res) => {
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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
