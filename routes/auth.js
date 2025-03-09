const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// User Registration
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this username already exists'
      });
    }

    // Create new user
    const user = new User({
      username,
      password // Password will be hashed by the model's pre-save middleware
    });

    await user.save();
    console.log('User saved successfully');

    // Generate token
    const token = jwt.sign(
      { _id: user._id, username: user.username, role: 'user' },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      role: 'user',
      username: user.username,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', { username: req.body.username });
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // Try to find user first
    let user = await User.findOne({ username });
    let isAdmin = false;

    // If user not found, try admin
    if (!user) {
      const admin = await Admin.findOne({ username });
      if (!admin) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      user = admin;
      isAdmin = true;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate token
    const token = jwt.sign(
      { 
        _id: user._id, 
        username: user.username, 
        role: isAdmin ? 'admin' : 'user' 
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '7d' }
    );

    console.log('Login successful for:', username, 'Role:', isAdmin ? 'admin' : 'user');

    res.json({
      token,
      role: isAdmin ? 'admin' : 'user',
      username: user.username,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    
    // Check if user is admin
    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded._id);
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      return res.json({
        user: {
          id: admin._id,
          username: admin.username,
          role: 'admin'
        }
      });
    }

    // Regular user
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      user: {
        id: user._id,
        username: user.username,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;