#!/usr/bin/env node

/**
 * Email Tool for RWSDK
 * 
 * This tool sets up Resend for email functionality in a Redwood project.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Main function to set up email functionality
 */
async function setupEmail() {
  console.log('\x1b[36m\nSetting up email functionality with Resend...\x1b[0m');
  
  try {
    // Step 1: Install resend
    console.log('\n\x1b[33m1. Installing resend package...\x1b[0m');
    execSync('pnpm add resend', { stdio: 'inherit' });
    console.log('\x1b[32m✓ Resend package installed successfully!\x1b[0m');

    // Step 2: Add RESEND_API to .env file
    console.log('\n\x1b[33m2. Adding RESEND_API to .env file...\x1b[0m');
    addToEnvFile();
    console.log('\x1b[32m✓ RESEND_API added to .env file!\x1b[0m');

    // Step 3: Create email.ts file
    console.log('\n\x1b[33m3. Creating email.ts file...\x1b[0m');
    createEmailFile();
    console.log('\x1b[32m✓ email.ts file created successfully!\x1b[0m');

    // Step 4: Ask about react-email
    console.log('\n\x1b[33m4. Would you like to install react-email? (y/n)\x1b[0m');
    const answer = await askQuestion('This will set up a react-email project for creating email templates: ');

    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log('\n\x1b[33mInstalling react-email...\x1b[0m');
      execSync('npx create-email@latest', { stdio: 'inherit' });
      console.log('\x1b[32m✓ react-email installed successfully!\x1b[0m');
    } else {
      console.log('\x1b[33mSkipping react-email installation.\x1b[0m');
    }

    console.log('\n\x1b[32m✓ Email setup completed successfully!\x1b[0m');
    console.log('\n\x1b[1mNext steps:\x1b[0m');
    console.log('  1. Add your Resend API key to the .env file');
    console.log('  2. Import and use the resend client in your application');
    console.log('     Example: import { resend } from "src/app/lib/email"');
    console.log('\n  Documentation: https://resend.com/docs\n');

  } catch (error) {
    console.error(`\x1b[31mError setting up email: ${error.message}\x1b[0m`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * Add RESEND_API to .env file
 */
function addToEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  // Add to .env
  try {
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    if (!envContent.includes('RESEND_API=')) {
      const newContent = envContent + (envContent.endsWith('\n') ? '' : '\n') + 'RESEND_API=\n';
      fs.writeFileSync(envPath, newContent);
    }
  } catch (error) {
    console.warn(`\x1b[33mWarning: Could not update .env file: ${error.message}\x1b[0m`);
  }
  
  // Add to .env.example if it exists
  try {
    if (fs.existsSync(envExamplePath)) {
      let envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
      
      if (!envExampleContent.includes('RESEND_API=')) {
        const newContent = envExampleContent + (envExampleContent.endsWith('\n') ? '' : '\n') + 'RESEND_API=your_resend_api_key\n';
        fs.writeFileSync(envExamplePath, newContent);
      }
    }
  } catch (error) {
    console.warn(`\x1b[33mWarning: Could not update .env.example file: ${error.message}\x1b[0m`);
  }
}

/**
 * Create email.ts file in src/app/lib directory
 */
function createEmailFile() {
  const libDir = path.join(process.cwd(), 'src', 'app', 'lib');
  const emailFilePath = path.join(libDir, 'email.ts');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }
  
  // Create email.ts file
  const emailFileContent = `import { Resend } from "resend";
import { env } from "cloudflare:workers";

export const resend = new Resend(env.RESEND_API);
`;
  
  fs.writeFileSync(emailFilePath, emailFileContent);
}

/**
 * Ask a question and return the answer
 * @param {string} question - The question to ask
 * @returns {Promise<string>} - The answer
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Run the setup
setupEmail();
