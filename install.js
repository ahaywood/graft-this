#!/usr/bin/env node

/**
 * GraftThis CLI
 * 
 * A command-line tool for installing and managing RWSDK utility tools.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  toolsDir: path.join(__dirname, 'tools'),
  defaultInstallPath: process.cwd()
};

// Ensure tools directory exists
if (!fs.existsSync(config.toolsDir)) {
  fs.mkdirSync(config.toolsDir, { recursive: true });
}

/**
 * Main function to process command line arguments
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    // Default behavior: install all tools
    installAllTools();
    return;
  }
  
  // Process specific commands
  switch (command) {
    case 'routes':
      installGenerateRoutesTool();
      break;
    case 'component':
      installComponentGeneratorTool();
      break;
    case 'tailwind':
      installTailwindSetup();
      break;
    case 'shadcn':
      installShadcnSetup();
      break;
    case 'seedtosql':
      installSeedToSqlTool();
      break;
    case 'help':
      showHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

/**
 * Show help information
 */
function showHelp() {
  console.log('\nGraftThis - Utility tools for RWSDK');
  console.log('\nUsage:');
  console.log('  npx graftthis                Install all tools');
  console.log('  npx graftthis routes         Install routes generator');
  console.log('  npx graftthis component      Install component generator');
  console.log('  npx graftthis tailwind       Set up Tailwind CSS for your project');
  console.log('  npx graftthis shadcn         Set up shadcn UI components for your project');
  console.log('  npx graftthis seedtosql      Install Seed to SQL converter');
  console.log('  npx graftthis help           Show this help message');
}

/**
 * Install all available tools
 */
function installAllTools() {
  console.log('Installing all GraftThis...');
  
  // Install all available tools
  installGenerateRoutesTool();
  installComponentGeneratorTool();
  installTailwindSetup();
  installShadcnSetup();
  installSeedToSqlTool();
  
  console.log('\nAll tools installed successfully!');
}

/**
 * Install the generateRoutes tool to the current project
 */
function installGenerateRoutesTool() {
  const targetPath = config.defaultInstallPath;
  const toolPath = path.join(config.toolsDir, 'generateRoutes');
  
  console.log('Installing generateRoutes tool...');
  
  try {
    // Create src/scripts directory if it doesn't exist
    const scriptsDir = path.join(targetPath, 'src', 'scripts');
    fs.mkdirSync(scriptsDir, { recursive: true });
    
    // Copy generateRoutes.ts to src/scripts directory
    const sourcePath = path.join(toolPath, 'generateRoutes.ts');
    const destPath = path.join(scriptsDir, 'generateRoutes.ts');
    
    if (!fs.existsSync(sourcePath)) {
      console.error(`Error: generateRoutes.ts not found at ${sourcePath}`);
      process.exit(1);
    }
    
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✓ Copied generateRoutes.ts to ${destPath}`);
    
    // Add script to package.json
    addScriptToPackageJson(targetPath, 'routes', 'npx tsx src/scripts/generateRoutes.ts');
    
    console.log('✓ generateRoutes tool installed successfully!');
  } catch (error) {
    console.error(`Error installing generateRoutes tool: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Add a script to the target project's package.json
 * @param {string} projectPath - Path to the project
 * @param {string} scriptName - Name of the script to add
 * @param {string} scriptCommand - Command to run for the script
 */
function addScriptToPackageJson(projectPath, scriptName, scriptCommand) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  try {
    if (!fs.existsSync(packageJsonPath)) {
      console.error(`Error: package.json not found at ${packageJsonPath}`);
      return;
    }
    
    // Read and parse the project's package.json
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // Initialize scripts section if it doesn't exist
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    // Add or update the script
    packageJson.scripts[scriptName] = scriptCommand;
    
    // Write the updated package.json back to the file
    // Preserve formatting by using the same spacing as the original file
    const spacing = packageJsonContent.includes('  "') ? 2 : packageJsonContent.includes('    "') ? 4 : 2;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, spacing));
    
    console.log(`✓ Added '${scriptName}' script to package.json: '${scriptCommand}'`);
  } catch (error) {
    console.error(`Error adding script to package.json: ${error.message}`);
  }
}

/**
 * Install the component generator tool to the current project
 */
function installComponentGeneratorTool() {
  const targetPath = config.defaultInstallPath;
  const toolPath = path.join(config.toolsDir, 'componentGenerator');
  
  console.log('Installing component generator tool...');
  
  try {
    // Check if plopfile.mjs exists in the project root
    const plopfilePath = path.join(targetPath, 'plopfile.mjs');
    const sourcePlopfilePath = path.join(toolPath, 'plopfile.mjs');
    
    if (!fs.existsSync(sourcePlopfilePath)) {
      console.error(`Error: plopfile.mjs not found at ${sourcePlopfilePath}`);
      process.exit(1);
    }
    
    // Copy plopfile.mjs to project root
    fs.copyFileSync(sourcePlopfilePath, plopfilePath);
    console.log(`✓ Copied plopfile.mjs to ${plopfilePath}`);
    
    // Create plop-templates directory and copy templates
    const templateSourceDir = path.join(toolPath, 'plop-templates');
    const templateTargetDir = path.join(targetPath, 'plop-templates');
    
    if (fs.existsSync(templateSourceDir)) {
      // Create the target directory if it doesn't exist
      if (!fs.existsSync(templateTargetDir)) {
        fs.mkdirSync(templateTargetDir, { recursive: true });
      }
      
      // Copy the component templates directory
      const componentSourceDir = path.join(templateSourceDir, 'components');
      const componentTargetDir = path.join(templateTargetDir, 'component');
      
      if (fs.existsSync(componentSourceDir)) {
        if (!fs.existsSync(componentTargetDir)) {
          fs.mkdirSync(componentTargetDir, { recursive: true });
        }
        
        // Copy all template files
        const templateFiles = fs.readdirSync(componentSourceDir);
        templateFiles.forEach(file => {
          const sourcePath = path.join(componentSourceDir, file);
          const targetPath = path.join(componentTargetDir, file);
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`✓ Copied template ${file} to ${targetPath}`);
        });
      }
    }
    
    // Add scripts to package.json
    addScriptToPackageJson(targetPath, 'plop', 'plop');
    addScriptToPackageJson(targetPath, 'component', 'plop component');
    addScriptToPackageJson(targetPath, 'restructure', 'plop restructure');
    addScriptToPackageJson(targetPath, 'restructure-all', 'plop restructure-all');
    
    // Check if plop is installed and install it if needed
    try {
      // Check if plop is installed
      const plopInstalled = checkPlopInstalled(targetPath);
      
      if (!plopInstalled) {
        console.log('\n⚠️ Plop is not installed in this project. Installing plop...');
        
        try {
          // Run the pnpm install command to install plop
          const { execSync } = require('child_process');
          execSync('pnpm install -D plop', {
            cwd: targetPath,
            stdio: 'inherit' // Show the output to the user
          });
          
          console.log('\n✅ Plop installed successfully!\n');
        } catch (error) {
          console.error(`\n❌ Error installing plop: ${error.message}`);
          console.log('\n⚠️ Please install plop manually by running:');
          console.log('\n  pnpm install -D plop\n');
        }
      } else {
        console.log('\n✅ Plop is already installed. You\'re all set!\n');
      }
    } catch (error) {
      // Ignore errors when checking for plop
      console.error(`Error checking for plop: ${error.message}`);
    }
    
    console.log('✓ Component generator tool installed successfully!');
  } catch (error) {
    console.error(`Error installing component generator tool: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Check if plop is installed in the project
 * @param {string} projectPath - Path to the project
 * @returns {boolean} - Whether plop is installed
 */
function checkPlopInstalled(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  try {
    if (fs.existsSync(packageJsonPath)) {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);
      
      // Check if plop is in dependencies or devDependencies
      const hasPlopDep = packageJson.dependencies && packageJson.dependencies.plop;
      const hasPlopDevDep = packageJson.devDependencies && packageJson.devDependencies.plop;
      
      return hasPlopDep || hasPlopDevDep;
    }
  } catch (error) {
    // Ignore errors when checking for plop
  }
  
  return false;
}

/**
 * Check if Tailwind CSS dependencies are installed in the project
 * @param {string} projectPath - Path to the project
 * @returns {boolean} - Whether Tailwind dependencies are installed
 */
function checkTailwindInstalled(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  try {
    if (fs.existsSync(packageJsonPath)) {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);
      
      // Check if tailwindcss and @tailwindcss/vite are in dependencies or devDependencies
      const hasTailwindDep = packageJson.dependencies && packageJson.dependencies.tailwindcss;
      const hasTailwindDevDep = packageJson.devDependencies && packageJson.devDependencies.tailwindcss;
      
      const hasTailwindViteDep = packageJson.dependencies && packageJson.dependencies['@tailwindcss/vite'];
      const hasTailwindViteDevDep = packageJson.devDependencies && packageJson.devDependencies['@tailwindcss/vite'];
      
      // Return true if both packages are installed (in either dependencies or devDependencies)
      return (hasTailwindDep || hasTailwindDevDep) && (hasTailwindViteDep || hasTailwindViteDevDep);
    }
  } catch (error) {
    // Ignore errors when checking for tailwind
  }
  
  return false;
}

/**
 * Install and set up Tailwind CSS for an RWSDK project
 */
function installTailwindSetup() {
  const targetPath = config.defaultInstallPath;
  
  console.log('Setting up Tailwind CSS for your RWSDK project...');
  
  try {
    // Step 1: Check if the project has the required files
    const viteConfigPath = path.join(targetPath, 'vite.config.mts');
    const documentPath = path.join(targetPath, 'src', 'app', 'Document.tsx');
    
    if (!fs.existsSync(viteConfigPath)) {
      console.error(`Error: vite.config.mts not found at ${viteConfigPath}`);
      console.error('Make sure you are in an RWSDK project directory.');
      process.exit(1);
    }
    
    if (!fs.existsSync(documentPath)) {
      console.error(`Error: Document.tsx not found at ${documentPath}`);
      console.error('Make sure you are in an RWSDK project directory.');
      process.exit(1);
    }
    
    // Step 2: Create or update the styles.css file
    const stylesDir = path.join(targetPath, 'src', 'app');
    const stylesPath = path.join(stylesDir, 'styles.css');
    
    if (!fs.existsSync(stylesDir)) {
      fs.mkdirSync(stylesDir, { recursive: true });
    }
    
    if (fs.existsSync(stylesPath)) {
      // File exists, check if it already has the tailwind import
      let stylesContent = fs.readFileSync(stylesPath, 'utf8');
      
      if (!stylesContent.includes('@import "tailwindcss"')) {
        // Add the import at the top of the file
        stylesContent = '@import "tailwindcss";\n' + stylesContent;
        fs.writeFileSync(stylesPath, stylesContent);
        console.log(`✓ Added Tailwind import to existing styles.css file at ${stylesPath}`);
      } else {
        console.log(`✓ Tailwind import already exists in styles.css`);
      }
    } else {
      // File doesn't exist, create it with just the tailwind import
      fs.writeFileSync(stylesPath, '@import "tailwindcss";');
      console.log(`✓ Created styles.css file at ${stylesPath}`);
    }
    
    // Step 3: Update the vite.config.mts file
    let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    
    // Check if tailwindcss is already imported
    if (!viteConfig.includes("import tailwindcss from '@tailwindcss/vite'")) {
      // Add the import statement at the top of the file
      viteConfig = "import tailwindcss from '@tailwindcss/vite'\n" + viteConfig;
      console.log('✓ Added tailwindcss import to vite.config.mts');
    }
    
    // Check if the environments config exists
    if (!viteConfig.includes('environments:')) {
      // Add the environments config
      viteConfig = viteConfig.replace(
        'export default defineConfig({',
        'export default defineConfig({\n  environments: {\n    ssr: {},\n  },'
      );
      console.log('✓ Added environments config to vite.config.mts');
    }
    
    // Check if tailwindcss is already in the plugins array
    if (!viteConfig.includes('tailwindcss()')) {
      // Add tailwindcss to the plugins array
      viteConfig = viteConfig.replace(
        /plugins:\s*\[([^\]]*)\]/,
        (match, plugins) => {
          if (plugins.trim().endsWith(',')) {
            return `plugins: [${plugins} tailwindcss()]`;
          } else if (plugins.trim()) {
            return `plugins: [${plugins}, tailwindcss()]`;
          } else {
            return `plugins: [tailwindcss()]`;
          }
        }
      );
      console.log('✓ Added tailwindcss to plugins array in vite.config.mts');
    }
    
    // Write the updated vite.config.mts file
    fs.writeFileSync(viteConfigPath, viteConfig);
    
    // Step 4: Update the Document.tsx file
    let documentContent = fs.readFileSync(documentPath, 'utf8');
    
    // Check if styles are already imported
    if (!documentContent.includes("import styles from './styles.css?url'")) {
      // Always add the import statement at the very top of the file
      documentContent = `import styles from './styles.css?url';\n\n${documentContent}`;
      console.log('✓ Added styles import to Document.tsx');
      
      // Double-check that the import was added
      if (!documentContent.includes("import styles from './styles.css?url'")) {
        console.log('⚠️ Warning: Import may not have been added correctly. Trying alternative method...');
        // Try a more direct approach by splitting into lines
        const lines = documentContent.split('\n');
        lines.unshift(`import styles from './styles.css?url';`);
        documentContent = lines.join('\n');
        console.log('✓ Added styles import using alternative method');
      }
    }
    
    // Check if the link tag is already in the head
    if (!documentContent.includes('<link rel="stylesheet" href={styles}')) {
      // Add the link tag to the head
      documentContent = documentContent.replace(
        /<head>(\s*)/,
        '<head>$1<link rel="stylesheet" href={styles} />$1'
      );
      console.log('✓ Added stylesheet link to Document.tsx');
    }
    
    // Write the updated Document.tsx file
    fs.writeFileSync(documentPath, documentContent);
    
    // Step 5: Check if dependencies are installed and install them if needed
    const tailwindInstalled = checkTailwindInstalled(targetPath);
    
    console.log('\n✓ Tailwind CSS setup complete!');
    
    if (!tailwindInstalled) {
      console.log('\n⚠️ Installing required dependencies...');
      
      try {
        // Run the pnpm install command as regular dependencies (not dev dependencies)
        const { execSync } = require('child_process');
        execSync('pnpm install tailwindcss @tailwindcss/vite', {
          cwd: targetPath,
          stdio: 'inherit' // Show the output to the user
        });
        
        console.log('\n✅ Tailwind dependencies installed successfully!\n');
      } catch (error) {
        console.error(`\n❌ Error installing dependencies: ${error.message}`);
        console.log('\n⚠️ Please install the dependencies manually by running:');
        console.log('\n  pnpm install tailwindcss @tailwindcss/vite\n');
      }
    } else {
      console.log('\n✅ Tailwind dependencies are already installed. You\'re all set!\n');
    }
    
  } catch (error) {
    console.error(`Error setting up Tailwind CSS: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Run the shadcn setup directly on the current project
 */
function installShadcnSetup() {
  const targetPath = config.defaultInstallPath;
  const toolPath = path.join(config.toolsDir, 'shadcnSetup');
  
  console.log('Setting up shadcn for your project...');
  
  try {
    // Require the shadcnSetup module
    const shadcnSetup = require(toolPath);
    
    // Run the setup directly
    shadcnSetup.install();
  } catch (error) {
    console.error(`Error setting up shadcn: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Install the Seed to SQL converter tool to the current project
 */
function installSeedToSqlTool() {
  const targetPath = config.defaultInstallPath;
  const toolPath = path.join(config.toolsDir, 'seedToSql');
  
  console.log('Installing Seed to SQL converter tool...');
  
  try {
    // Create scripts directory if it doesn't exist
    const scriptsDir = path.join(targetPath, 'scripts');
    fs.mkdirSync(scriptsDir, { recursive: true });
    
    // Copy seedToSql.mjs to scripts directory
    const sourcePath = path.join(toolPath, 'seedToSql.mjs');
    const destPath = path.join(scriptsDir, 'seedToSql.mjs');
    
    if (!fs.existsSync(sourcePath)) {
      console.error(`Error: seedToSql.mjs not found at ${sourcePath}`);
      process.exit(1);
    }
    
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✓ Copied seedToSql.mjs to ${destPath}`);
    
    // Make the script executable
    try {
      fs.chmodSync(destPath, '755');
      console.log(`✓ Made seedToSql.mjs executable`);
    } catch (error) {
      console.warn(`Warning: Could not make seedToSql.mjs executable: ${error.message}`);
    }
    
    // Add script to package.json
    addScriptToPackageJson(targetPath, 'seedtosql', 'node scripts/seedToSql.mjs');
    
    console.log('✓ Seed to SQL converter tool installed successfully!');
    console.log('\nUsage:');
    console.log('  npm run seedtosql -- --input <path-to-seed-file> [--output <path-to-output-sql>]');
  } catch (error) {
    console.error(`Error installing Seed to SQL converter tool: ${error.message}`);
    process.exit(1);
  }
}

// Start the CLI
main();
