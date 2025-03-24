const express = require('express');
const router = express.Router();

/**
 * Admin login route
 * POST /api/admin/login
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
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
    
    res.json({ 
      success: true, 
      token: token,
      message: 'Login successful' 
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
});

// Add other admin routes as needed

module.exports = router; 