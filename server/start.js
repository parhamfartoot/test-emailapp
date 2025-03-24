// Import Node.js built-in modules for process management
const { spawn } = require('child_process'); // Allows starting other processes
const path = require('path'); // Helps with file paths

// Start the API server (server.js) as a separate process
// This is the part that listens for web requests from the frontend
const server = spawn('node', ['server.js'], {
  stdio: 'inherit', // Share the same console output as the parent process
  shell: true, // Run in a shell environment
  cwd: __dirname, // Run in the current directory
  env: {
    ...process.env, // Pass all environment variables
    PORT: process.env.PORT || 3001 // Use PORT from Render or default to 3001
  }
});

// Start the email worker (emailWorker.js) as a separate process
// This is the part that sends scheduled emails
const emailWorker = spawn('node', ['emailWorker.js'], {
  stdio: 'inherit', // Share the same console output as the parent process
  shell: true, // Run in a shell environment
  cwd: __dirname // Run in the current directory
});

// Handle any errors with the server process
server.on('error', (error) => {
  console.error('Server process error:', error);
});

// Handle any errors with the email worker process
emailWorker.on('error', (error) => {
  console.error('Email worker process error:', error);
});

// Handle shutdown when user presses Ctrl+C
// This ensures all processes are properly terminated
process.on('SIGINT', () => {
  server.kill(); // Stop the server process
  emailWorker.kill(); // Stop the email worker process
  process.exit(0); // Exit this process cleanly
}); 