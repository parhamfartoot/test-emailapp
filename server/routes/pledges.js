const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Pledge = require('../models/Pledge');

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
    const newPledge = new Pledge(req.body);
    const savedPledge = await newPledge.save();
    res.status(201).json({ success: true, data: savedPledge });
  } catch (error) {
    console.error('Error creating pledge:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Failed to create pledge', 
      error: error.message 
    });
  }
});

module.exports = router; 