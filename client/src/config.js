// Configuration file for the Earth Promises application
// Update this value for different environments

// Base URL for API requests 
// For local development: http://localhost:5001
// For production: Use your actual domain, e.g., https://api.earthpromises.com
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Export other configuration values as needed
export const APP_CONFIG = {
  // Application name
  appName: 'Earth Promises',
  
  // Time between updates for the promise tree (in milliseconds)
  updateInterval: 30000,
  
  // Default items to show per page in carousels
  itemsPerPage: 3
}; 