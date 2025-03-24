const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n===== Earth Promises Deployment Preparation =====\n');

// Create a function to prompt for input
function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function prepareDeployment() {
  try {
    console.log('This script will help you prepare for deployment\n');
    
    // Get deployment information
    const serverDomain = await askQuestion('Enter your server domain (e.g., https://api.mysite.com): ');
    const clientDomain = await askQuestion('Enter your client domain (e.g., https://mysite.com): ');
    
    console.log('\nUpdating configuration files...');
    
    // Update client package.json
    const clientPackagePath = path.join(__dirname, 'client', 'package.json');
    const clientPackageContent = fs.readFileSync(clientPackagePath, 'utf8');
    const clientPackageJson = JSON.parse(clientPackageContent);
    
    // Update build:prod script
    clientPackageJson.scripts['build:prod'] = `cross-env REACT_APP_API_URL=${serverDomain} react-scripts build`;
    
    // Write back to package.json
    fs.writeFileSync(clientPackagePath, JSON.stringify(clientPackageJson, null, 2), 'utf8');
    console.log('✅ Updated client/package.json');
    
    // Update server CORS settings
    const serverJsPath = path.join(__dirname, 'server', 'server.js');
    let serverJsContent = fs.readFileSync(serverJsPath, 'utf8');
    
    // Replace CORS origin
    serverJsContent = serverJsContent.replace(
      /\['https:\/\/your-client-domain\.com'\]/g, 
      `['${clientDomain}']`
    );
    
    fs.writeFileSync(serverJsPath, serverJsContent, 'utf8');
    console.log('✅ Updated server/server.js CORS settings');
    
    // Update .env.production
    const envPath = path.join(__dirname, 'server', '.env.production');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace CLIENT_DOMAIN
    envContent = envContent.replace(
      /CLIENT_DOMAIN=https:\/\/your-client-domain\.com/g,
      `CLIENT_DOMAIN=${clientDomain}`
    );
    
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ Updated server/.env.production');
    
    console.log('\n===== Deployment Preparation Complete =====');
    console.log('\nNext steps:');
    console.log('1. Run "cd client && npm run build:prod" to build the client');
    console.log('2. Deploy your client and server following DEPLOYMENT.md guide');
    console.log('3. Make sure to set all environment variables on your hosting provider');
    
  } catch (error) {
    console.error('Error preparing for deployment:', error);
  } finally {
    rl.close();
  }
}

prepareDeployment(); 