require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const cameraRoutes = require('./routes/camera');
const teddyRoutes = require('./routes/teddy');
const furnitureRoutes = require('./routes/furniture');
const adminRoutes = require('./routes/admin');
const { apiRateLimit } = require('./middleware/rateLimit');

const app = express();

// MongoDB connection with environment variables
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.log('Unable to connect to MongoDB Atlas!');
    console.error(error);
  });

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Static files
app.use('/images', express.static(path.join(__dirname, 'images')));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rate limiting middleware
app.use(apiRateLimit);

// API routes
app.use('/api/cameras', cameraRoutes);
app.use('/api/teddies', teddyRoutes);
app.use('/api/furniture', furnitureRoutes);
app.use('/api/admin', adminRoutes);

// 404 error handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    error: {
      message: error.message || 'Internal Server Error',
      status: statusCode
    }
  });
});

module.exports = app;