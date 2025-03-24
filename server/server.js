// Import required dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'https://email-app-client.onrender.com',
    'http://localhost:3000' // For local development
  ],
  credentials: true
}));

// JSON parsing middleware
app.use(express.json());

// Import routes
const adminRoutes = require('./routes/admin');
// Uncomment these when implemented
// const userRoutes = require('./routes/users');
// const emailRoutes = require('./routes/emails');

// Use routes
app.use('/api/admin', adminRoutes);
// Uncomment these when implemented
// app.use('/api/users', userRoutes);
// app.use('/api/emails', emailRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Email scheduler API is running');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Configure port for Render deployment
const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 