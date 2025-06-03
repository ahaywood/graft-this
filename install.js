#!/usr/bin/env node

/**
 * RWSDK Tools CLI
 *
 * A command-line tool for installing and managing RWSDK utility tools.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const config = {
  toolsDir: path.join(__dirname, "tools"),
  defaultInstallPath: process.cwd(),
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
    case "routes":
      installGenerateRoutesTool();
      break;
    case "component":
      installComponentGeneratorTool();
      break;
    case "tailwind":
      installTailwindSetup();
      break;
    case "shadcn":
      installShadcnSetup();
      break;
    case "seedtosql":
      installSeedToSqlTool();
      break;
    case "merge":
      installMergePrismaTool();
      break;
    case "email":
      installEmailTool();
      break;
    case "help":
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
  console.log("\n\x1b[1;36mRWSDK Tools - Utility tools for Redwood SDK\x1b[0m");
  console.log("\nUsage:");
  console.log("  npx rwsdk-tools                Install all tools");
  console.log("  npx rwsdk-tools routes         Install routes generator");
  console.log("  npx rwsdk-tools component      Install component generator");
  console.log(
    "  npx rwsdk-tools tailwind       Set up Tailwind CSS for your project"
  );
  console.log(
    "  npx rwsdk-tools shadcn         Set up shadcn UI components for your project"
  );
  console.log("  npx rwsdk-tools seedtosql      Install Seed to SQL converter");
  console.log("  npx rwsdk-tools merge          Install Prisma schema merger");
  console.log("  npx rwsdk-tools email          Set up email functionality with Resend");
  console.log("  npx rwsdk-tools help           Show this help message");
}

/**
 * Install all available tools
 */
function installAllTools() {
  console.log("\x1b[36mInstalling all GraftThis...\x1b[0m");

  // Install all available tools
  installGenerateRoutesTool();
  installComponentGeneratorTool();
  installTailwindSetup();
  installShadcnSetup();
  installSeedToSqlTool();
  installMergePrismaTool();
  installEmailTool();

  console.log("\n\x1b[32mAll tools installed successfully!\x1b[0m");
}

/**
 * Install the generateRoutes tool to the current project
 */
function installGenerateRoutesTool() {
  const targetPath = config.defaultInstallPath;
  const toolPath = path.join(config.toolsDir, "generateRoutes");

  console.log("\x1b[36mInstalling generateRoutes tool...\x1b[0m");

  try {
    // Create src/scripts directory if it doesn't exist
    const scriptsDir = path.join(targetPath, "src", "scripts");
    fs.mkdirSync(scriptsDir, { recursive: true });

    // Copy generateRoutes.ts to src/scripts directory
    const sourcePath = path.join(toolPath, "generateRoutes.ts");
    const destPath = path.join(scriptsDir, "generateRoutes.ts");

    if (!fs.existsSync(sourcePath)) {
      console.error(`Error: generateRoutes.ts not found at ${sourcePath}`);
      process.exit(1);
    }

    fs.copyFileSync(sourcePath, destPath);
    console.log(`\x1b[32m✓ Copied generateRoutes.ts to ${destPath}\x1b[0m`);

    // Add script to package.json
    addScriptToPackageJson(
      targetPath,
      "routes",
      "npx tsx src/scripts/generateRoutes.ts"
    );

    console.log("\x1b[32m✓ generateRoutes tool installed successfully!\x1b[0m");
    console.log("\n\n👉 \x1b[1mNext steps:\x1b[0m");
    console.log("  pnpm routes\n\n");
  } catch (error) {
    console.error(
      `\x1b[31mError installing generateRoutes tool: ${error.message}\x1b[0m`
    );
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
  const packageJsonPath = path.join(projectPath, "package.json");

  try {
    if (!fs.existsSync(packageJsonPath)) {
      console.error(`Error: package.json not found at ${packageJsonPath}`);
      return;
    }

    // Read and parse the project's package.json
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonContent);

    // Initialize scripts section if it doesn't exist
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    // Add or update the script
    packageJson.scripts[scriptName] = scriptCommand;

    // Write the updated package.json back to the file
    // Preserve formatting by using the same spacing as the original file
    const spacing = packageJsonContent.includes('  "')
      ? 2
      : packageJsonContent.includes('    "')
      ? 4
      : 2;
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, spacing)
    );

    console.log(
      `\x1b[32m✓ Added '${scriptName}' script to package.json: '${scriptCommand}'\x1b[0m`
    );
  } catch (error) {
    console.error(`Error adding script to package.json: ${error.message}`);
  }
}

/**
 * Install the component generator tool to the current project
 */
function installComponentGeneratorTool() {
  const targetPath = config.defaultInstallPath;
  const toolPath = path.join(config.toolsDir, "componentGenerator");

  console.log("\x1b[36mInstalling component generator tool...\x1b[0m");

  try {
    // Check if plopfile.mjs exists in the project root
    const plopfilePath = path.join(targetPath, "plopfile.mjs");
    const sourcePlopfilePath = path.join(toolPath, "plopfile.mjs");

    if (!fs.existsSync(sourcePlopfilePath)) {
      console.error(`Error: plopfile.mjs not found at ${sourcePlopfilePath}`);
      process.exit(1);
    }

    // Copy plopfile.mjs to project root
    fs.copyFileSync(sourcePlopfilePath, plopfilePath);
    console.log(`\x1b[32m\u2713 Copied plopfile.mjs to ${plopfilePath}\x1b[0m`);

    // Create plop-templates directory and copy templates
    const templateSourceDir = path.join(toolPath, "plop-templates");
    const templateTargetDir = path.join(targetPath, "plop-templates");

    if (fs.existsSync(templateSourceDir)) {
      // Create the target directory if it doesn't exist
      if (!fs.existsSync(templateTargetDir)) {
        fs.mkdirSync(templateTargetDir, { recursive: true });
      }

      // Copy the component templates directory
      const componentSourceDir = path.join(templateSourceDir, "components");
      const componentTargetDir = path.join(templateTargetDir, "component");

      if (fs.existsSync(componentSourceDir)) {
        if (!fs.existsSync(componentTargetDir)) {
          fs.mkdirSync(componentTargetDir, { recursive: true });
        }

        // Copy all template files
        const templateFiles = fs.readdirSync(componentSourceDir);
        templateFiles.forEach((file) => {
          const sourcePath = path.join(componentSourceDir, file);
          const targetPath = path.join(componentTargetDir, file);
          fs.copyFileSync(sourcePath, targetPath);
          console.log(
            `\x1b[32m\u2713 Copied template ${file} to ${targetPath}\x1b[0m`
          );
        });
      }
    }

    // Add scripts to package.json
    addScriptToPackageJson(targetPath, "plop", "plop");
    addScriptToPackageJson(targetPath, "component", "plop component");
    addScriptToPackageJson(targetPath, "restructure", "plop restructure");
    addScriptToPackageJson(
      targetPath,
      "restructure-all",
      "plop restructure-all"
    );

    // Check if plop is installed and install it if needed
    try {
      // Check if plop is installed
      const plopInstalled = checkPlopInstalled(targetPath);

      if (!plopInstalled) {
        console.log(
          "\n\x1b[33m\u26A0\uFE0F Plop is not installed in this project. Installing plop..."
        );

        try {
          // Run the pnpm install command to install plop
          const { execSync } = require("child_process");
          execSync("pnpm install -D plop", {
            cwd: targetPath,
            stdio: "inherit", // Show the output to the user
          });

          console.log("\n\x1b[32m\u2705 Plop installed successfully!\x1b[0m\n");
        } catch (error) {
          console.error(
            `\n\x1b[31m\u274C Error installing plop: ${error.message}\x1b[0m`
          );
          console.log(
            "\n\x1b[33m\u26A0\uFE0F Please install plop manually by running:\x1b[0m"
          );
          console.log("\n  pnpm install -D plop\n");
        }
      } else {
        console.log(
          "\n\x1b[32m\u2713 Plop is already installed. You're all set!\x1b[0m\n"
        );
      }
    } catch (error) {
      // Ignore errors when checking for plop
      console.error(`Error checking for plop: ${error.message}`);
    }

    console.log(
      "\x1b[32m\u2713 Component generator tool installed successfully!\x1b[0m"
    );
    console.log("\n\n👉 \x1b[1mNext steps:\x1b[0m");
    console.log("  pnpm run component\n\n");
  } catch (error) {
    console.error(
      `\x1b[31mError installing component generator tool: ${error.message}\x1b[0m`
    );
    process.exit(1);
  }
}

/**
 * Check if plop is installed in the project
 * @param {string} projectPath - Path to the project
 * @returns {boolean} - Whether plop is installed
 */
function checkPlopInstalled(projectPath) {
  const packageJsonPath = path.join(projectPath, "package.json");

  try {
    if (fs.existsSync(packageJsonPath)) {
      const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
      const packageJson = JSON.parse(packageJsonContent);

      // Check if plop is in dependencies or devDependencies
      const hasPlopDep =
        packageJson.dependencies && packageJson.dependencies.plop;
      const hasPlopDevDep =
        packageJson.devDependencies && packageJson.devDependencies.plop;

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
  const packageJsonPath = path.join(projectPath, "package.json");

  try {
    if (fs.existsSync(packageJsonPath)) {
      const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
      const packageJson = JSON.parse(packageJsonContent);

      // Check if tailwindcss and @tailwindcss/vite are in dependencies or devDependencies
      const hasTailwindDep =
        packageJson.dependencies && packageJson.dependencies.tailwindcss;
      const hasTailwindDevDep =
        packageJson.devDependencies && packageJson.devDependencies.tailwindcss;

      const hasTailwindViteDep =
        packageJson.dependencies &&
        packageJson.dependencies["@tailwindcss/vite"];
      const hasTailwindViteDevDep =
        packageJson.devDependencies &&
        packageJson.devDependencies["@tailwindcss/vite"];

      // Return true if both packages are installed (in either dependencies or devDependencies)
      return (
        (hasTailwindDep || hasTailwindDevDep) &&
        (hasTailwindViteDep || hasTailwindViteDevDep)
      );
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

  console.log(
    "\x1b[36mSetting up Tailwind CSS for your RWSDK project...\x1b[0m"
  );

  try {
    // Step 1: Check if the project has the required files
    const viteConfigPath = path.join(targetPath, "vite.config.mts");
    const documentPath = path.join(targetPath, "src", "app", "Document.tsx");

    if (!fs.existsSync(viteConfigPath)) {
      console.error(
        `\x1b[31mError: vite.config.mts not found at ${viteConfigPath}\x1b[0m`
      );
      console.error("Make sure you are in an RWSDK project directory.");
      process.exit(1);
    }

    if (!fs.existsSync(documentPath)) {
      console.error(
        `\x1b[31mError: Document.tsx not found at ${documentPath}\x1b[0m`
      );
      console.error("Make sure you are in an RWSDK project directory.");
      process.exit(1);
    }

    // Step 2: Create or update the styles.css file
    const stylesDir = path.join(targetPath, "src", "app");
    const stylesPath = path.join(stylesDir, "styles.css");

    if (!fs.existsSync(stylesDir)) {
      fs.mkdirSync(stylesDir, { recursive: true });
    }

    if (fs.existsSync(stylesPath)) {
      // File exists, check if it already has the tailwind import
      let stylesContent = fs.readFileSync(stylesPath, "utf8");

      if (!stylesContent.includes('@import "tailwindcss"')) {
        // Add the import at the top of the file
        stylesContent = '@import "tailwindcss";\n' + stylesContent;
        fs.writeFileSync(stylesPath, stylesContent);
        console.log(
          `\x1b[32m\u2713 Added Tailwind import to existing styles.css file at ${stylesPath}\x1b[0m`
        );
      } else {
        console.log(
          `\x1b[32m\u2713 Tailwind import already exists in styles.css\x1b[0m`
        );
      }
    } else {
      // File doesn't exist, create it with just the tailwind import
      fs.writeFileSync(stylesPath, '@import "tailwindcss";');
      console.log(
        `\x1b[32m\u2713 Created styles.css file at ${stylesPath}\x1b[0m`
      );
    }

    // Step 3: Update the vite.config.mts file
    let viteConfig = fs.readFileSync(viteConfigPath, "utf8");

    // Check if tailwindcss is already imported
    if (!viteConfig.includes("import tailwindcss from '@tailwindcss/vite'")) {
      // Add the import statement at the top of the file
      viteConfig = "import tailwindcss from '@tailwindcss/vite'\n" + viteConfig;
      console.log(
        "\x1b[32m\u2713 Added tailwindcss import to vite.config.mts\x1b[0m"
      );
    }

    // Check if the environments config exists
    if (!viteConfig.includes("environments:")) {
      // Add the environments config
      viteConfig = viteConfig.replace(
        "export default defineConfig({",
        "export default defineConfig({\n  environments: {\n    ssr: {},\n  },"
      );
      console.log(
        "\x1b[32m\u2713 Added environments config to vite.config.mts\x1b[0m"
      );
    }

    // Check if tailwindcss is already in the plugins array
    if (!viteConfig.includes("tailwindcss()")) {
      // Add tailwindcss to the plugins array
      viteConfig = viteConfig.replace(
        /plugins:\s*\[([^\]]*)\]/,
        (match, plugins) => {
          if (plugins.trim().endsWith(",")) {
            return `plugins: [${plugins} tailwindcss()]`;
          } else if (plugins.trim()) {
            return `plugins: [${plugins}, tailwindcss()]`;
          } else {
            return `plugins: [tailwindcss()]`;
          }
        }
      );
      console.log(
        "\x1b[32m\u2713 Added tailwindcss to plugins array in vite.config.mts\x1b[0m"
      );
    }

    // Write the updated vite.config.mts file
    fs.writeFileSync(viteConfigPath, viteConfig);

    // Step 4: Update the Document.tsx file
    let documentContent = fs.readFileSync(documentPath, "utf8");

    // Check if styles are already imported
    if (!documentContent.includes("import styles from './styles.css?url'")) {
      // Always add the import statement at the very top of the file
      documentContent = `import styles from './styles.css?url';\n\n${documentContent}`;
      console.log("\x1b[32m\u2713 Added styles import to Document.tsx\x1b[0m");

      // Double-check that the import was added
      if (!documentContent.includes("import styles from './styles.css?url'")) {
        console.log(
          "\x1b[33m\u26A0\uFE0F Warning: Import may not have been added correctly. Trying alternative method...\x1b[0m"
        );
        // Try a more direct approach by splitting into lines
        const lines = documentContent.split("\n");
        lines.unshift(`import styles from './styles.css?url';`);
        documentContent = lines.join("\n");
        console.log(
          "\x1b[32m\u2713 Added styles import using alternative method\x1b[0m"
        );
      }
    }

    // Check if the link tag is already in the head
    if (!documentContent.includes('<link rel="stylesheet" href={styles}')) {
      // Add the link tag to the head
      documentContent = documentContent.replace(
        /<head>(\s*)/,
        '<head>$1<link rel="stylesheet" href={styles} />$1'
      );
      console.log(
        "\x1b[32m\u2713 Added stylesheet link to Document.tsx\x1b[0m"
      );
    }

    // Write the updated Document.tsx file
    fs.writeFileSync(documentPath, documentContent);

    // Step 5: Check if dependencies are installed and install them if needed
    const tailwindInstalled = checkTailwindInstalled(targetPath);

    console.log("\n\x1b[32m\u2713 Tailwind CSS setup complete!\x1b[0m");

    if (!tailwindInstalled) {
      console.log(
        "\n\x1b[33m\u26A0\uFE0F Installing required dependencies...\x1b[0m"
      );

      try {
        // Run the pnpm install command as regular dependencies (not dev dependencies)
        const { execSync } = require("child_process");
        execSync("pnpm install tailwindcss @tailwindcss/vite", {
          cwd: targetPath,
          stdio: "inherit", // Show the output to the user
        });

        console.log(
          "\n\x1b[32m\u2705 Tailwind dependencies installed successfully!\x1b[0m\n"
        );
      } catch (error) {
        console.error(
          `\n\x1b[31m\u274C Error installing dependencies: ${error.message}\x1b[0m`
        );
        console.log(
          "\n\x1b[33m\u26A0\uFE0F Please install the dependencies manually by running:\x1b[0m"
        );
        console.log("\n  pnpm install tailwindcss @tailwindcss/vite\n");
      }
    } else {
      console.log(
        "\n\x1b[32m\u2705 Tailwind dependencies are already installed. You're all set!\x1b[0m\n"
      );
    }
  } catch (error) {
    console.error(
      `\x1b[31mError setting up Tailwind CSS: ${error.message}\x1b[0m`
    );
    process.exit(1);
  }
}

/**
 * Run the shadcn setup directly on the current project
 */
function installShadcnSetup() {
  const targetPath = config.defaultInstallPath;
  const toolPath = path.join(config.toolsDir, "shadcnSetup");

  console.log("\x1b[36mSetting up shadcn for your project...\x1b[0m");

  try {
    // Require the shadcnSetup module
    const shadcnSetup = require(toolPath);

    // Run the setup directly
    shadcnSetup.install();
  } catch (error) {
    console.error(`\x1b[31mError setting up shadcn: ${error.message}\x1b[0m`);
    process.exit(1);
  }
}

/**
 * Install the Seed to SQL converter tool to the current project
 */
function installSeedToSqlTool() {
  const targetPath = config.defaultInstallPath;
  const toolPath = path.join(config.toolsDir, "seedToSql");

  console.log("\x1b[36mInstalling Seed to SQL converter tool...\x1b[0m");

  try {
    // Create src/scripts directory if it doesn't exist
    const scriptsDir = path.join(targetPath, "src", "scripts");
    fs.mkdirSync(scriptsDir, { recursive: true });

    // Copy seedToSql.mjs to src/scripts directory
    const sourcePath = path.join(toolPath, "seedToSql.mjs");
    const destPath = path.join(scriptsDir, "seedToSql.mjs");

    if (!fs.existsSync(sourcePath)) {
      console.error(
        `\x1b[31mError: seedToSql.mjs not found at ${sourcePath}\x1b[0m`
      );
      process.exit(1);
    }

    fs.copyFileSync(sourcePath, destPath);
    console.log(`\x1b[32m\u2713 Copied seedToSql.mjs to ${destPath}\x1b[0m`);

    // Make the script executable
    try {
      fs.chmodSync(destPath, "755");
      console.log(`\x1b[32m\u2713 Made seedToSql.mjs executable\x1b[0m`);
    } catch (error) {
      console.warn(
        `\x1b[33mWarning: Could not make seedToSql.mjs executable: ${error.message}\x1b[0m`
      );
    }

    // Add script to package.json
    addScriptToPackageJson(
      targetPath,
      "seedtosql",
      "node src/scripts/seedToSql.mjs"
    );

    console.log(
      "\x1b[32m\u2713 Seed to SQL converter tool installed successfully!\x1b[0m"
    );
    console.log("\n\n👉 \x1b[1mNext Steps:\x1b[0m");
    console.log("  pnpm run seedtosql\n\n");
  } catch (error) {
    console.error(
      `\x1b[31mError installing Seed to SQL converter tool: ${error.message}\x1b[0m`
    );
    process.exit(1);
  }
}

/**
 * Install the Prisma schema merger tool to the current project
 */
function installMergePrismaTool() {
  console.log("\x1b[36mInstalling Prisma schema merger tool...\x1b[0m");

  const projectPath = config.defaultInstallPath;
  const scriptsDir = path.join(projectPath, "src", "scripts");
  const sourceFile = path.join(
    __dirname,
    "tools",
    "mergePrisma",
    "mergePrismaSchema.mjs"
  );
  const targetFile = path.join(scriptsDir, "mergePrismaSchema.mjs");

  try {
    // Create scripts directory if it doesn't exist
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
      console.log(`\x1b[32m✓ Created scripts directory: ${scriptsDir}\x1b[0m`);
    }

    // Copy the mergePrismaSchema.mjs file to the scripts directory
    fs.copyFileSync(sourceFile, targetFile);
    console.log(
      `\x1b[32m✓ Copied mergePrismaSchema.mjs to ${targetFile}\x1b[0m`
    );

    // Add the script to package.json
    addScriptToPackageJson(
      projectPath,
      "merge",
      "node src/scripts/mergePrismaSchema.mjs"
    );

    console.log(
      "\n\x1b[32mPrisma schema merger tool installed successfully!\x1b[0m"
    );
    console.log("\n\n👉 \x1b[1mNext steps:\x1b[0m");
    console.log("  pnpm merge\n\n");
  } catch (error) {
    console.error(
      `Error installing Prisma schema merger tool: ${error.message}`
    );
  }
}

/**
 * Install the email tool and set up email functionality with Resend
 */
function installEmailTool() {
  const toolPath = path.join(config.toolsDir, "email");
  const emailScriptPath = path.join(toolPath, "index.js");

  console.log("\x1b[36mSetting up email functionality...\x1b[0m");

  try {
    // Make sure the email script is executable
    fs.chmodSync(emailScriptPath, '755');
    
    // Execute the email setup script
    execSync(`node ${emailScriptPath}`, { stdio: 'inherit' });
    
    console.log("\x1b[32m✓ Email functionality set up successfully!\x1b[0m");
  } catch (error) {
    console.error(`\x1b[31mError setting up email functionality: ${error.message}\x1b[0m`);
    process.exit(1);
  }
}

// Start the CLI
main();
