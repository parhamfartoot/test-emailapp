const express = require('express');
const router = express.Router();
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