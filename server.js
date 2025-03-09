require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');

console.log('Starting server initialization...');

const app = express();
const server = http.createServer(app);

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS configuration
app.use(cors());

// Body parser middleware
app.use(express.json());

// MongoDB Connection
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Spirit11')
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Socket connection handler
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

// Routes
const authRoutes = require('./routes/auth');
const playerRoutes = require('./routes/players');
const userRoutes = require('./routes/users');
const userTeamRoutes = require('./routes/userTeam');
const chatbotRoutes = require('./routes/chatbot');

// Test route
app.get('/api/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'API is working' });
});

// Route middleware
app.use('/api/auth', (req, res, next) => {
  console.log('Auth route accessed:', req.method, req.url);
  next();
}, authRoutes);

app.use('/api/players', playerRoutes);
app.use('/api/team', userTeamRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

const PORT = 5001;

// Start server
try {
  server.listen(PORT, () => {
    console.log('=================================');
    console.log(`Server running on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}`);
    console.log('=================================');
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

module.exports = { io };