// controllers/authController.js
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

exports.register = async (req, res) => {
  console.log('Request body:', req.body);

  const { username, email, password } = req.body;

  console.log('Received data for registration:', { username, email, password });

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.createUser(username, email, hashedPassword);
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  console.log('Request body:', req.body);

  const { email, password } = req.body;

  console.log('Received data for login:', { email, password });

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    req.session.user = user; // Save user data in session
    res.status(200).json({ message: 'User logged in successfully', user });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
};
