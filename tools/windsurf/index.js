#!/usr/bin/env node

/**
 * Windsurf Tool for RWSDK
 * 
 * This tool sets up Windsurf configuration in a Redwood project.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Main function to set up Windsurf configuration
 */
function setupWindsurf() {
  console.log('\x1b[36m\nSetting up Windsurf configuration...\x1b[0m');
  
  try {
    // Step 1: Create .windsurf directory if it doesn't exist
    console.log('\n\x1b[33m1. Creating .windsurf directory...\x1b[0m');
    const windsurfDir = path.join(process.cwd(), '.windsurf');
    
    if (!fs.existsSync(windsurfDir)) {
      fs.mkdirSync(windsurfDir);
      console.log('\x1b[32m✓ Created .windsurf directory\x1b[0m');
    } else {
      console.log('\x1b[33m⚠ .windsurf directory already exists\x1b[0m');
    }

    // Step 2: Create rules directory and copy files
    console.log('\n\x1b[33m2. Setting up rules...\x1b[0m');
    const rulesDir = path.join(windsurfDir, 'rules');
    const sourceRulesDir = path.join(__dirname, 'rules');
    
    if (!fs.existsSync(rulesDir)) {
      fs.mkdirSync(rulesDir);
      console.log('\x1b[32m✓ Created .windsurf/rules directory\x1b[0m');
    } else {
      console.log('\x1b[33m⚠ .windsurf/rules directory already exists\x1b[0m');
    }
    
    // Copy rule files
    copyFiles(sourceRulesDir, rulesDir);
    console.log('\x1b[32m✓ Copied rule files to .windsurf/rules\x1b[0m');

    // Step 3: Create workflows directory and copy files
    console.log('\n\x1b[33m3. Setting up workflows...\x1b[0m');
    const workflowsDir = path.join(windsurfDir, 'workflows');
    const sourceWorkflowsDir = path.join(__dirname, 'workflows');
    
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir);
      console.log('\x1b[32m✓ Created .windsurf/workflows directory\x1b[0m');
    } else {
      console.log('\x1b[33m⚠ .windsurf/workflows directory already exists\x1b[0m');
    }
    
    // Copy workflow files
    copyFiles(sourceWorkflowsDir, workflowsDir);
    console.log('\x1b[32m✓ Copied workflow files to .windsurf/workflows\x1b[0m');

    // Success message
    console.log('\n\x1b[32m✓ Windsurf configuration set up successfully!\x1b[0m');
    console.log('\n\x1b[1mNext steps:\x1b[0m');
    console.log('  1. Review the rules in .windsurf/rules');
    console.log('  2. Review the workflows in .windsurf/workflows');
    console.log('  3. Customize the configuration to suit your project needs');
    console.log('\n  For more information, visit the Windsurf documentation.\n');

  } catch (error) {
    console.error(`\x1b[31mError setting up Windsurf: ${error.message}\x1b[0m`);
    process.exit(1);
  }
}

/**
 * Copy files from source directory to destination directory
 * @param {string} sourceDir - Source directory
 * @param {string} destDir - Destination directory
 */
function copyFiles(sourceDir, destDir) {
  const files = fs.readdirSync(sourceDir);
  
  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      // Create directory if it doesn't exist
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath);
      }
      
      // Recursively copy files
      copyFiles(sourcePath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

// Run the setup
setupWindsurf();
