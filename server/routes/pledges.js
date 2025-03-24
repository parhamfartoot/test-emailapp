const express = require('express');
const router = express.Router();
const Pledge = require('../models/Pledge');
const nodemailer = require('nodemailer');

// Create nodemailer transporter with detailed logging
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
  
  // Verify transporter configuration
  transporter.verify(function(error, success) {
    if (error) {
      console.error('Email transporter verification failed:', error);
    }
  });
} catch (error) {
  console.error('Failed to create email transporter:', error);
}

// Send confirmation email
const sendConfirmationEmail = async (pledge) => {
  if (!transporter) {
    console.error('Email transporter not initialized');
    return { success: false, error: 'Email service not configured' };
  }
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: pledge.email,
      subject: 'Thank you for your pledge!',
      html: `
        <h2>Thank you for your pledge, ${pledge.name}!</h2>
        <p>We've received your promise:</p>
        <blockquote>${pledge.promise}</blockquote>
        <p>Your commitment helps make our community better.</p>
        ${pledge.reminderConsent ? '<p>We will send you reminders to help you keep your promise.</p>' : ''}
        <p>Regards,<br>The Promise Tree Team</p>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all pledges
 * GET /api/pledges
 */
router.get('/', async (req, res) => {
  try {
    const pledges = await Pledge.find().sort({ createdAt: -1 });
    res.json({ success: true, data: pledges });
  } catch (error) {
    console.error('Error fetching pledges:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pledges', 
      error: error.message 
    });
  }
});

/**
 * Get pledge by ID
 * GET /api/pledges/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const pledge = await Pledge.findById(req.params.id);
    if (!pledge) {
      return res.status(404).json({ success: false, message: 'Pledge not found' });
    }
    res.json({ success: true, data: pledge });
  } catch (error) {
    console.error('Error fetching pledge:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pledge', 
      error: error.message 
    });
  }
});

/**
 * Create a new pledge
 * POST /api/pledges
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, promise, reminderConsent } = req.body;
    
    // Validate required fields
    if (!name || !email || !promise) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, and promise' 
      });
    }
    
    // Create new pledge
    const newPledge = new Pledge({
      name,
      email,
      promise,
      reminderConsent: reminderConsent || false
    });
    
    // Save pledge
    const savedPledge = await newPledge.save();
    
    // Send confirmation email
    const emailResult = await sendConfirmationEmail(savedPledge);
    
    // Return success with pledge data and email status
    res.status(201).json({
      success: true,
      message: 'Pledge created successfully',
      data: savedPledge,
      emailSent: emailResult.success,
      emailDetails: emailResult
    });
  } catch (error) {
    console.error('Error creating pledge:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create pledge', 
      error: error.message 
    });
  }
});

/**
 * Update a pledge
 * PUT /api/pledges/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const updatedPledge = await Pledge.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedPledge) {
      return res.status(404).json({ success: false, message: 'Pledge not found' });
    }
    
    res.json({ success: true, data: updatedPledge });
  } catch (error) {
    console.error('Error updating pledge:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Failed to update pledge', 
      error: error.message 
    });
  }
});

/**
 * Delete a pledge
 * DELETE /api/pledges/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedPledge = await Pledge.findByIdAndDelete(req.params.id);
    
    if (!deletedPledge) {
      return res.status(404).json({ success: false, message: 'Pledge not found' });
    }
    
    res.json({ success: true, data: deletedPledge });
  } catch (error) {
    console.error('Error deleting pledge:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete pledge', 
      error: error.message 
    });
  }
});

module.exports = router; 