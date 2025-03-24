const express = require('express');
const router = express.Router();

/**
 * Admin login route
 * POST /api/admin/login
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt with username:', username);
  console.log('Environment username:', process.env.ADMIN_USERNAME);
  
  // Use environment variables for authentication
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (username === adminUsername && password === adminPassword) {
    // Generate JWT token using the secret key
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { username: adminUsername, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Login successful');
    
    res.json({ 
      success: true, 
      token: token,
      message: 'Login successful' 
    });
  } else {
    console.log('Login failed - invalid credentials');
    
    res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
});

/**
 * Debug route to check environment variables (REMOVE IN PRODUCTION)
 * GET /api/admin/debug
 */
router.get('/debug', (req, res) => {
  res.json({
    adminUsernameExists: !!process.env.ADMIN_USERNAME,
    adminPasswordExists: !!process.env.ADMIN_PASSWORD,
    jwtSecretExists: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV
  });
});

// Add other admin routes as needed

module.exports = router; 