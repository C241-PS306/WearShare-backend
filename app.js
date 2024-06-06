// app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const authRoutes = require('./routes/authRoutes');
const listRoutes = require('./routes/listRoutes')

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies (form-data)
app.use(express.urlencoded({ extended: true }));

// Middleware to handle multipart/form-data
const upload = multer();

// Verify if the secret key is loaded
if (!process.env.SECRET_KEY) {
  throw new Error('SECRET_KEY is not defined in the environment variables');
}

// Middleware to handle sessions
app.use(session({
  secret: process.env.SECRET_KEY, // Use the secret key from the environment variables
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Apply multer middleware only to routes that require it
app.use('/auth', upload.none(), authRoutes);
app.use('/list', listRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

