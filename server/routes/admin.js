const express = require('express');
const router = express.Router();

/**
 * Admin login route
 * POST /api/admin/login
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple authentication logic
  // In a production environment, use proper authentication with hashed passwords
  if (username === 'adminEarthPromise2025' && password === 'yourpassword') {
    res.json({ 
      success: true, 
      token: 'sample-token',
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