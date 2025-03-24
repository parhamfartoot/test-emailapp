// emailWorker.js - Handles sending scheduled reminder emails
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Import the Pledge model
const Pledge = require('./models/Pledge');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/earth-promises')
  .then(() => {
    startEmailWorker();
  })
  .catch(err => {
    process.exit(1);
  });

// Set up the email sending service (nodemailer)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: true
  }
});

// Verify email configuration
transporter.verify(function(error, success) {
  // Verify silently
});

// Calculate the date when a reminder should be sent (5 years after creation)
function calculateReminderDate(createdAt) {
  const reminderDate = new Date(createdAt);
  reminderDate.setFullYear(reminderDate.getFullYear() + 5);
  return reminderDate;
}

// Function to send reminder email
async function sendReminderEmail(pledge) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: pledge.email,
      subject: 'Reminder of Your Earth Promise',
      text: `
Hello ${pledge.name},

Five years ago, you made a promise to our planet:

"${pledge.promise}"

We're reaching out to remind you of this commitment and hope that you've been able to keep it.

Thank you for being part of our global initiative to make Earth a better place.

Best regards,
The Earth Promises Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Update the pledge to mark the reminder as processed
    pledge.remindersProcessed = true;
    await pledge.save();
    
    return true;
  } catch (error) {
    return false;
  }
}

// Main worker function
async function checkAndSendReminders() {
  try {
    const now = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    
    // Find pledges that:
    // 1. Were created approximately 5 years ago (with some buffer)
    // 2. Have consented to reminders
    // 3. Haven't been processed yet
    const pendingReminders = await Pledge.find({
      reminderConsent: true,
      remindersProcessed: false,
      createdAt: { $lte: fiveYearsAgo }
    });
    
    // Process each reminder
    for (const pledge of pendingReminders) {
      await sendReminderEmail(pledge);
      
      // Add a small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    // Handle error silently
  }
}

// Start the worker process
function startEmailWorker() {
  // Run immediately on startup
  checkAndSendReminders();
  
  // Then run every hour (3600000 milliseconds)
  setInterval(checkAndSendReminders, 3600000);
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
}); 