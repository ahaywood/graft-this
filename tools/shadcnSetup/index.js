const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Run the shadcn setup script directly for a RedwoodSDK project
 * @param {Object} options - Installation options
 */
function install(options = {}) {
  const projectRoot = process.cwd();
  
  console.log('🔨 Setting up shadcn for your RedwoodSDK project...');
  
  try {
    // Run the setup script directly
    const setupScriptPath = path.join(__dirname, 'setupShadcn.js');
    
    // Make sure the script is executable
    fs.chmodSync(setupScriptPath, '755');
    
    // Execute the script directly
    execSync(`node "${setupScriptPath}"`, { 
      stdio: 'inherit',
      cwd: projectRoot
    });
    
    console.log('✅ shadcn setup completed successfully!');
  } catch (error) {
    console.error(`❌ Error setting up shadcn: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { install };
