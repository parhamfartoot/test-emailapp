const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

/**
 * Admin login route
 * POST /api/admin/login
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Important: Keep the login attempt logs for security purposes
  console.log('Login attempt with username:', username);
  
  // Use environment variables for authentication
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (username === adminUsername && password === adminPassword) {
    // Generate JWT token using the secret key
    const token = jwt.sign(
      { username: adminUsername, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Important: Keep the login success log for security purposes
    console.log('Login successful');
    
    res.json({ 
      success: true, 
      token: token,
      message: 'Login successful' 
    });
  } else {
    // Important: Keep the login failure log for security purposes
    console.log('Login failed - invalid credentials');
    
    res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
});

/**
 * Verify JWT token for admin
 * GET /api/admin/verify
 */
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Return success with the decoded data
    res.json({
      success: true,
      message: 'Token is valid',
      user: decoded
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
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

/**
 * Get all pledges (admin-only route)
 * GET /api/admin/pledges
 */
router.get('/pledges', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }
  
  try {
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET);
    
    // Import the Pledge model
    const Pledge = require('../models/Pledge');
    
    // Fetch all pledges
    Pledge.find().sort({ createdAt: -1 })
      .then(pledges => {
        // Return in the expected format
        res.json({ success: true, data: pledges });
      })
      .catch(err => {
        console.error('Error fetching pledges:', err);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to fetch pledges', 
          error: err.message 
        });
      });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

/**
 * Delete a pledge (admin-only route)
 * DELETE /api/admin/pledges/:id
 */
router.delete('/pledges/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }
  
  try {
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET);
    
    // Import the Pledge model
    const Pledge = require('../models/Pledge');
    
    // Delete the pledge
    Pledge.findByIdAndDelete(req.params.id)
      .then(deletedPledge => {
        if (!deletedPledge) {
          return res.status(404).json({ 
            success: false, 
            message: 'Pledge not found' 
          });
        }
        
        res.json({ 
          success: true, 
          data: deletedPledge,
          message: 'Pledge deleted successfully' 
        });
      })
      .catch(err => {
        console.error('Error deleting pledge:', err);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to delete pledge', 
          error: err.message 
        });
      });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

// Add other admin routes as needed

module.exports = router; 