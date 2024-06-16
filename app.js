require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const winston = require('winston');
const { Sequelize } = require('sequelize');
const User = require('./models/user.cjs'); // Adjust the path as needed

const app = express();

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

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Database connection
const sequelize = new Sequelize('pharmadb', 'root', 'Shubh@1705', {
    host: '127.0.0.1',
    dialect: 'mysql',
    port: 33060
});

// Sync database
sequelize.sync()
    .then(() => {
        console.log('Database connected and synchronized');
    })
    .catch(err => {
        logger.error('Database connection failed:', err);
        console.error('Database connection failed:', err);
    });

// Print environment variable for debugging
console.log('SECRET_KEY:', process.env.SECRET_KEY);

// Middleware to check the token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// User registration route
app.post('/register', async (req, res) => {
    const { username, password, name, email } = req.body;
    try {
        // Check if name and email are provided
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        const user = await User.create({ username, password, name, email });
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        // Handle validation errors
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => ({
                message: err.message,
                type: err.type,
                field: err.path
            }));
            return res.status(400).json({ message: 'Validation error', errors });
        }
        // Handle other errors
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
        if (user && await user.validatePassword(password)) {
            const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, { expiresIn: '1h' });
            res.json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        logger.error('Login error:', {
            message: error.message,
            stack: error.stack,
            input: req.body
        });
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// Define a protected route
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

// Another protected route
app.get('/user/profile', authenticateToken, (req, res) => {
    res.json({ message: 'This is the user profile', user: req.user });
});

// An example of a POST route that is protected
app.post('/user/update', authenticateToken, async (req, res) => {
    // Update user information
    try {
        const { name, email } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.name = name;
        user.email = email;
        await user.save();
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'User update failed', error: error.message });
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
