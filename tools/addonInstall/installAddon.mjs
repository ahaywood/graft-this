#!/usr/bin/env node

// Force the script to run from the project root directory
process.chdir(new URL('../../', import.meta.url).pathname);

/**
 * RWSDK Add-on Installer
 * 
 * This script automates the installation of RWSDK add-ons by reading their addon.jsonc file
 * and performing the necessary installation steps.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Determine project root - this is important for running the script from any directory
let projectRoot;
try {
  // Try to get the absolute path to the project root
  projectRoot = path.resolve(__dirname, '../../');
  
  // Verify that the path exists
  if (!fs.existsSync(projectRoot)) {
    throw new Error(`Project root directory not found: ${projectRoot}`);
  }
  
  // Log the project root for debugging
  console.log(`Project root: ${projectRoot}`);
} catch (error) {
  console.error(`Error determining project root: ${error.message}`);
  console.error('Please run this script from within the project directory.');
  process.exit(1);
}

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

/**
 * Log a message with emoji and color
 */
function log(emoji, message, color = colors.reset) {
  console.log(`${emoji}  ${color}${message}${colors.reset}`);
}

/**
 * Check if a directory exists, create it if it doesn't
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    log('📁', `Creating directory: ${dirPath}`, colors.yellow);
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }
  return false;
}

/**
 * Run a shell command and log the output
 */
function runCommand(command, cwd = projectRoot) {
  log('🚀', `Running: ${command}`, colors.blue);
  log('📂', `Directory: ${cwd}`, colors.blue);
  
  try {
    // Verify the directory exists before attempting to run the command
    if (!fs.existsSync(cwd)) {
      log('❌', `Directory does not exist: ${cwd}`, colors.red);
      return false;
    }
    
    // Run the command with the specified working directory
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    log('❌', `Command failed: ${command}`, colors.red);
    console.error(error.message);
    return false;
  }
}

/**
 * Copy a directory recursively
 */
function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) {
    log('❌', `Source directory not found: ${source}`, colors.red);
    return false;
  }
  
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  
  // Read all files and directories in the source
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy directory
      copyDirectory(sourcePath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, destPath);
    }
  }
  
  log('📋', `Copied directory from ${source} to ${destination}`, colors.green);
  return true;
}

/**
 * Install an add-on from a local directory
 */
function installFromLocal(sourcePath, addonName, destinationDir) {
  const sourceAddonDir = path.join(sourcePath, addonName);
  const destinationAddonDir = path.join(destinationDir, addonName);
  
  log('📋', `Copying add-on from ${sourceAddonDir} to ${destinationAddonDir}`, colors.blue);
  return copyDirectory(sourceAddonDir, destinationAddonDir);
}

/**
 * Install an add-on from a GitHub repository
 */
function installFromGitHub(repoUrl, addonName) {
  const addonsDir = path.join(projectRoot, 'src/app/addons');
  ensureDirectoryExists(addonsDir);
  
  // Clone the repository using degit
  const command = `npx degit ${repoUrl} ${addonName}`;
  return runCommand(command, addonsDir);
}

/**
 * Install npm packages
 */
function installPackages(packages) {
  if (!packages || packages.length === 0) return true;
  
  log('📦', `Installing packages: ${packages.join(', ')}`, colors.cyan);
  return runCommand(`pnpm add ${packages.join(' ')}`);
}

/**
 * Add environment variables to .env file
 */
function addEnvVariables(envVars) {
  if (!envVars || envVars.length === 0) return true;
  
  const envPath = path.join(projectRoot, '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  let updated = false;
  
  for (const envVar of envVars) {
    if (!envContent.includes(`${envVar}=`)) {
      envContent += `\n${envVar}=`;
      updated = true;
      log('🔑', `Added ${envVar} to .env file`, colors.yellow);
    }
  }
  
  if (updated) {
    fs.writeFileSync(envPath, envContent);
  }
  
  return true;
}

/**
 * Inject CSS import into styles file
 */
function injectStyles(styles) {
  if (!styles) return true;
  
  const { source, injectInto, injectDirective } = styles;
  
  if (!source || !injectInto || !injectDirective) {
    log('⚠️', 'Missing style information in addon.jsonc', colors.yellow);
    return false;
  }
  
  const stylesPath = path.join(projectRoot, injectInto);
  let stylesContent = '';
  
  if (fs.existsSync(stylesPath)) {
    stylesContent = fs.readFileSync(stylesPath, 'utf8');
  } else {
    ensureDirectoryExists(path.dirname(stylesPath));
  }
  
  if (!stylesContent.includes(injectDirective)) {
    // Check if we need to handle Tailwind and shadcn imports
    const isTailwindImport = stylesContent.includes('@import "tailwindcss";');
    const isShadcnImport = stylesContent.includes('@import "tw-animate-css";');
    
    if (stylesContent.trim() === '') {
      // Empty file, add imports in the right order
      if (!isTailwindImport) {
        stylesContent += '@import "tailwindcss";\n';
      }
      if (!isShadcnImport) {
        stylesContent += '@import "tw-animate-css";\n';
      }
      stylesContent += injectDirective + '\n';
    } else {
      // File has content, append the directive
      stylesContent += '\n' + injectDirective;
    }
    
    fs.writeFileSync(stylesPath, stylesContent);
    log('🎨', `Added style import to ${injectInto}`, colors.magenta);
  }
  
  return true;
}

/**
 * Add routes to worker.tsx
 */
function addRoutes(addonName, routes) {
  if (!routes) return true;
  
  const { file, prefix } = routes;
  if (!file) {
    log('⚠️', 'Missing routes file information in addon.jsonc', colors.yellow);
    return false;
  }
  
  const workerPath = path.join(projectRoot, 'src/worker.tsx');
  if (!fs.existsSync(workerPath)) {
    log('❌', 'worker.tsx not found', colors.red);
    return false;
  }
  
  let workerContent = fs.readFileSync(workerPath, 'utf8');
  
  // Import path for the routes
  // Make sure to use the correct file extension (.ts or .tsx)
  const fileBase = file.replace(/\.(ts|tsx)$/, '');
  const importPath = `./app/addons/${addonName}/${fileBase}`;
  const importName = `${addonName.charAt(0).toUpperCase() + addonName.slice(1)}Routes`;
  const importStatement = `import ${importName} from "${importPath}";`;
  
  log('📝', `Adding import: ${importStatement}`, colors.blue);
  
  // Check if import already exists
  if (!workerContent.includes(importStatement) && !workerContent.includes(`import ${importName} from`)) {
    // Find the last import statement
    const lastImportIndex = workerContent.lastIndexOf('import ');
    const lastImportEndIndex = workerContent.indexOf('\n', lastImportIndex);
    
    if (lastImportIndex !== -1) {
      // Insert the new import after the last import
      workerContent = 
        workerContent.slice(0, lastImportEndIndex + 1) + 
        importStatement + '\n' + 
        workerContent.slice(lastImportEndIndex + 1);
      
      log('✅', `Added import statement to worker.tsx`, colors.green);
    } else {
      // No imports found, add at the beginning
      workerContent = importStatement + '\n' + workerContent;
      log('✅', `Added import statement to worker.tsx`, colors.green);
    }
  } else {
    log('ℹ️', `Import already exists in worker.tsx`, colors.blue);
  }
  
  // Add the route to the render function
  // First check if the route is already added
  const routeCheckPattern = prefix 
    ? new RegExp(`prefix\\(\\s*["']${prefix.replace(/\//g, '\\/')}["']\\s*,\\s*${importName}`)
    : new RegExp(`\.\.\.${importName}`);
  
  if (!routeCheckPattern.test(workerContent)) {
    // Find the render array
    const renderIndex = workerContent.indexOf('render: [');
    if (renderIndex !== -1) {
      // Find the end of the render array
      const renderEndIndex = workerContent.indexOf(']', renderIndex);
      
      if (renderEndIndex !== -1) {
        // Prepare the route statement
        let routeStatement;
        if (prefix) {
          routeStatement = `      prefix("${prefix}", ${importName}),\n`;
          log('📝', `Adding route with prefix: ${prefix}`, colors.blue);
        } else {
          routeStatement = `      ...${importName},\n`;
          log('📝', `Adding route with spread syntax`, colors.blue);
        }
        
        // Insert the route before the end of the array
        workerContent = 
          workerContent.slice(0, renderEndIndex) + 
          routeStatement + 
          workerContent.slice(renderEndIndex);
        
        log('✅', `Added routes to worker.tsx render array`, colors.green);
      } else {
        log('⚠️', `Could not find end of render array in worker.tsx`, colors.yellow);
      }
    } else {
      log('⚠️', `Could not find render array in worker.tsx`, colors.yellow);
    }
  } else {
    log('ℹ️', `Routes already added to worker.tsx`, colors.blue);
  }
  
  fs.writeFileSync(workerPath, workerContent);
  return true;
}

/**
 * Prepare Prisma schema directory structure
 */
function preparePrismaSchema() {
  const prismaDir = path.join(projectRoot, 'prisma');
  const prismaSchemaDir = path.join(prismaDir, 'schema');
  const mainSchemaPath = path.join(prismaDir, 'schema.prisma');
  const schemaInSchemaDir = path.join(prismaSchemaDir, 'schema.prisma');
  
  // Create prisma directory if it doesn't exist
  ensureDirectoryExists(prismaDir);
  
  // Create prisma/schema directory if it doesn't exist
  ensureDirectoryExists(prismaSchemaDir);
  
  // Check if prisma/schema/schema.prisma exists
  if (!fs.existsSync(schemaInSchemaDir)) {
    log('📁', 'Setting up prisma/schema/schema.prisma', colors.yellow);
    
    // Check if prisma/schema.prisma exists
    if (fs.existsSync(mainSchemaPath)) {
      // Move prisma/schema.prisma to prisma/schema/schema.prisma
      log('📋', 'Moving prisma/schema.prisma to prisma/schema/schema.prisma', colors.yellow);
      const schemaContent = fs.readFileSync(mainSchemaPath, 'utf8');
      fs.writeFileSync(schemaInSchemaDir, schemaContent);
    } else {
      // Create a basic schema.prisma file
      log('📝', 'Creating basic prisma/schema/schema.prisma', colors.yellow);
      const basicSchema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
`;
      fs.writeFileSync(schemaInSchemaDir, basicSchema);
    }
  }
  
  
  return true;
}

/**
 * Merge Prisma schema files
 */
function mergePrismaSchema() {
  // First prepare the Prisma schema directory structure
  preparePrismaSchema();
  
  log('🔄', 'Merging Prisma schema files', colors.blue);
  const result = runCommand('npx rwsdk-tools merge');
  
  if (result) {
    log('🔄', 'Creating migration for merged schema', colors.blue);
    return runCommand('pnpm migrate:new "merge addon schema"');
  }
  
  return result;
}

/**
 * Install and run the generate routes script
 */
function generateRoutes() {
  log('🔄', 'Installing generate routes script', colors.blue);
  const installResult = runCommand('npx rwsdk-tools routes');
  
  if (installResult) {
    log('🔄', 'Generating routes', colors.blue);
    return runCommand('pnpm routes');
  }
  
  return installResult;
}

/**
 * Install ShadCN components
 */
function installShadcnComponents(components) {
  if (!components || components.length === 0) return true;
  
  log('🔄', 'Installing ShadCN components', colors.blue);
  
  // First ensure shadcn/ui is installed
  log('🔄', 'Ensuring shadcn/ui is installed', colors.blue);
  const shadcnInstalled = runCommand('npx rwsdk-tools shadcn');
  
  if (!shadcnInstalled) {
    log('⚠️', 'Failed to install shadcn/ui base', colors.yellow);
    return false;
  }
  
  // Install each component
  let allSuccess = true;
  for (const component of components) {
    log('💾', `Installing ShadCN component: ${component}`, colors.blue);
    
    // Check if the component already exists
    const componentPath = path.join(projectRoot, 'src/app/components/ui', `${component}.tsx`);
    if (fs.existsSync(componentPath)) {
      log('ℹ️', `Component ${component} already exists, skipping`, colors.blue);
      continue;
    }
    
    // Install the component
    const success = runCommand(`npx shadcn-ui add ${component}`);
    if (!success) {
      log('⚠️', `Failed to install component: ${component}`, colors.yellow);
      allSuccess = false;
    }
  }
  
  return allSuccess;
}

/**
 * Main function to install an add-on
 */
async function installAddon(addonPath, sourceAddonPath = null) {
  try {
    log('🚀', `Installing add-on from: ${addonPath}`, colors.green);
    
    // Read the addon.jsonc file from the source project if provided, otherwise from the destination
    const addonJsoncPath = sourceAddonPath 
      ? path.join(sourceAddonPath, 'addon.jsonc')
      : path.join(addonPath, 'addon.jsonc');
      
    if (!fs.existsSync(addonJsoncPath)) {
      log('❌', `addon.jsonc not found at ${addonJsoncPath}`, colors.red);
      return false;
    }
    
    // Parse the addon.jsonc file (handle comments in jsonc)
    const addonJsoncContent = fs.readFileSync(addonJsoncPath, 'utf8')
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
    
    const addonConfig = JSON.parse(addonJsoncContent);
    const addonName = addonConfig.name || path.basename(addonPath);
    
    log('📝', `Installing add-on: ${addonName}`, colors.green);
    
    // Check if Tailwind is required
    if (addonConfig.tailwind) {
      log('🔄', 'Installing Tailwind', colors.blue);
      runCommand('npx rwsdk-tools tailwind');
    }
    
    // Check if shadcn/ui is required
    if (addonConfig.shadcn) {
      if (typeof addonConfig.shadcn === 'boolean') {
        // Simple boolean flag
        log('🔄', 'Installing shadcn/ui', colors.blue);
        runCommand('npx rwsdk-tools shadcn');
      } else if (addonConfig.shadcn.required) {
        // Object with required flag and components list
        log('🔄', 'Installing shadcn/ui and components', colors.blue);
        
        // Install specific components if listed
        if (addonConfig.shadcn.components && addonConfig.shadcn.components.length > 0) {
          installShadcnComponents(addonConfig.shadcn.components);
        } else {
          // Just install the base if no specific components
          runCommand('npx rwsdk-tools shadcn');
        }
      }
    }
    
    // Install packages
    if (addonConfig.packages) {
      installPackages(addonConfig.packages);
    }
    
    // Add environment variables
    if (addonConfig.env) {
      addEnvVariables(addonConfig.env);
    }
    
    // Inject styles
    if (addonConfig.styles) {
      injectStyles(addonConfig.styles);
    }
    
    // Add routes
    if (addonConfig.routes) {
      addRoutes(addonName, addonConfig.routes);
    }
    
    // Merge Prisma schema and create migration
    mergePrismaSchema();
    
    // Generate routes
    generateRoutes();
    
    // Display post-install message
    if (addonConfig.postInstallMessage) {
      log('✅', addonConfig.postInstallMessage, colors.green);
    } else {
      log('✅', `Add-on ${addonName} installed successfully`, colors.green);
    }
    
    return true;
  } catch (error) {
    log('❌', `Error installing add-on: ${error.message}`, colors.red);
    console.error(error);
    return false;
  }
}

/**
 * Install an add-on from a GitHub repository
 */
async function installFromRepo(repoUrl, addonName) {
  try {
    // Create the addons directory if it doesn't exist
    const addonsDir = path.join(projectRoot, 'src/app/addons');
    ensureDirectoryExists(addonsDir);
    
    // Store the current project path as the source path
    const sourceAddonPath = path.join(projectRoot, 'src/app/addons', addonName);
    
    // Install the add-on from GitHub
    const success = installFromGitHub(repoUrl, addonName);
    if (!success) {
      log('❌', 'Failed to install add-on from GitHub', colors.red);
      return false;
    }
    
    // Install the add-on, passing both the destination path and source path
    const destinationAddonPath = path.join(addonsDir, addonName);
    return await installAddon(destinationAddonPath, sourceAddonPath);
  } catch (error) {
    log('❌', `Error installing add-on from repo: ${error.message}`, colors.red);
    console.error(error);
    return false;
  }
}

// Parse command line arguments using a simple flag-based approach
const args = process.argv.slice(2);

// Define flags and their values
const flags = {};
let currentFlag = null;
let positionalArgs = [];

// Check if the first argument is 'install' and skip it if it is
let startIndex = 0;
if (args.length > 0 && args[0] === 'install') {
  startIndex = 1;
}

// Parse flags and arguments
for (let i = startIndex; i < args.length; i++) {
  const arg = args[i];
  
  if (arg.startsWith('--')) {
    // This is a flag
    currentFlag = arg.slice(2);
    flags[currentFlag] = true; // Default to true if no value is provided
  } else if (currentFlag) {
    // This is a value for the previous flag
    flags[currentFlag] = arg;
    currentFlag = null;
  } else {
    // This is a positional argument
    positionalArgs.push(arg);
  }
}

// Helper function to display usage
function displayUsage() {
  log('ℹ️', 'Usage:', colors.blue);
  log('', 'install [options] <addonName>', colors.reset);
  log('', '', colors.reset);
  log('', 'Options:', colors.blue);
  log('', '  --repo <url>         Install from a GitHub repository', colors.reset);
  log('', '  --source <path>      Full path to the add-on directory (not its parent)', colors.reset);
  log('', '  --dest <path>        Destination directory (defaults to src/app/addons)', colors.reset);
  log('', '  --help               Display this help message', colors.reset);
  log('', '', colors.reset);
  log('', 'Examples:', colors.green);
  log('', '  Install from local directory:', colors.reset);
  log('', '    node src/scripts/installAddon.mjs install suggest --source /path/to/addons/suggest', colors.reset);
  log('', '  Install from GitHub repository:', colors.reset);
  log('', '    node src/scripts/installAddon.mjs install suggest --repo https://github.com/username/repo/addons', colors.reset);
  log('', '', colors.reset);
  log('', 'Note: The --source flag should point directly to the add-on directory itself, not its parent directory.', colors.cyan);
  process.exit(1);
}

// Check for help flag
if (flags.help) {
  displayUsage();
}

// Get the add-on name (first positional argument)
const addonName = positionalArgs[0];

if (!addonName) {
  log('❌', 'Please provide an add-on name', colors.red);
  displayUsage();
}

// Default destination directory
const destinationDir = flags.dest || path.join(projectRoot, 'src/app/addons');
ensureDirectoryExists(destinationDir);

// Determine installation type and execute
async function executeInstall() {
  try {
    if (flags.repo) {
      // Install from GitHub repository
      const repoUrl = flags.repo;
      log('🚀', `Installing add-on ${addonName} from repository: ${repoUrl}`, colors.blue);
      
      // Create the addons directory if it doesn't exist
      ensureDirectoryExists(destinationDir);
      
      // Install from GitHub
      const success = installFromGitHub(`${repoUrl}/${addonName}`, addonName);
      if (!success) {
        log('❌', 'Failed to install add-on from GitHub', colors.red);
        process.exit(1);
      }
      
      // Continue with installation process
      const destinationAddonPath = path.join(destinationDir, addonName);
      await installAddon(destinationAddonPath);
    } else if (flags.source) {
      // Install from local directory
      const sourceDir = flags.source;
      log('🚀', `Installing add-on ${addonName} from local directory: ${sourceDir}`, colors.blue);
      
      // The source path is the add-on directory itself, not a parent directory
      const sourceAddonPath = sourceDir;
      const destinationAddonPath = path.join(destinationDir, addonName);
      
      if (!fs.existsSync(sourceAddonPath)) {
        log('❌', `Source add-on directory not found: ${sourceAddonPath}`, colors.red);
        process.exit(1);
      }
      
      // Copy the files
      const copySuccess = copyDirectory(sourceAddonPath, destinationAddonPath);
      if (!copySuccess) {
        log('❌', 'Failed to copy add-on files', colors.red);
        process.exit(1);
      }
      
      // Continue with installation process
      await installAddon(destinationAddonPath, sourceAddonPath);
    } else {
      log('❌', 'Please specify either --repo or --source flag', colors.red);
      displayUsage();
    }
    
    process.exit(0);
  } catch (error) {
    log('❌', `Error during installation: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// Execute the installation
executeInstall();
