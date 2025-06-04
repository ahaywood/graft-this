#!/usr/bin/env node

// Force the script to run from the project root directory
process.chdir(new URL("../../", import.meta.url).pathname);

/**
 * RWSDK Add-on Config Generator
 *
 * This script analyzes an add-on's content and dynamically generates the addon.jsonc file
 * by scanning imports, environment variables, CSS files, and other components.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../../");

// ANSI color codes for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

/**
 * Log a message with emoji and color
 */
// Verbose logging function (disabled)
function verboseLog(emoji, message, color = colors.reset) {
  // Disabled verbose logging
}

// Quiet logging function - only shows essential messages
function log(emoji, message, color = colors.reset) {
  // Only log essential messages (start, completion, errors)
  if (emoji === '✅' || emoji === '❌' || emoji === '🔍') {
    console.log(`${emoji}  ${color}${message}${colors.reset}`);
  }
}

/**
 * Find all files in a directory recursively
 */
function findFiles(dir, fileList = [], extension = null) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findFiles(filePath, fileList, extension);
    } else if (!extension || file.endsWith(extension)) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Extract imports from JavaScript/TypeScript files
 */
function extractImports(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const imports = new Set();

  // Match import statements
  // This regex captures package names from various import formats
  const importRegex =
    /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+[^,]+|[^,{}\s*]+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+[^,]+|[^,{}\s*]+))*\s+from\s+)?['"]([^'"./][^'"]*)['"]/g;

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const packageName = match[1];

    // Skip relative imports and internal modules
    if (
      !packageName.startsWith(".") &&
      !packageName.startsWith("@redwoodsdk/")
    ) {
      // Extract the base package name (e.g., 'date-fns/format' -> 'date-fns')
      const baseName = packageName.split("/")[0];
      imports.add(baseName);
    }
  }

  return [...imports];
}

/**
 * Extract environment variables from env.example file
 */
function extractEnvVars(addonDir) {
  const envExamplePath = path.join(addonDir, "env.example");

  if (fs.existsSync(envExamplePath)) {
    const content = fs.readFileSync(envExamplePath, "utf8");
    const envVars = [];

    // Match environment variable names
    const envVarRegex = /^([A-Z0-9_]+)=/gm;

    let match;
    while ((match = envVarRegex.exec(content)) !== null) {
      envVars.push(match[1]);
    }

    return envVars;
  }

  return [];
}

/**
 * Find CSS files in the add-on directory
 */
function findCssFiles(addonDir) {
  return findFiles(addonDir, [], ".css");
}

/**
 * Find route files in the add-on directory
 */
function findRouteFile(addonDir) {
  const possibleRouteFiles = [
    "routes.ts",
    "routes.tsx",
    "routes.js",
    "routes.jsx",
  ];

  for (const routeFile of possibleRouteFiles) {
    const routePath = path.join(addonDir, routeFile);
    if (fs.existsSync(routePath)) {
      return {
        file: routeFile,
        path: routePath,
      };
    }
  }

  return null;
}

/**
 * Detect if Tailwind is needed for the addon
 */
function detectTailwindNeeded(addonDir, hasShadcn) {
  // If the addon uses ShadCN, it definitely needs Tailwind
  if (hasShadcn) {
    return true;
  }
  
  // Check if there are any CSS files with @apply directives
  const cssFiles = findFiles(addonDir, [], ".css");
  
  for (const cssFile of cssFiles) {
    const content = fs.readFileSync(cssFile, "utf8");
    if (content.includes("@apply")) {
      return true;
    }
  }
  
  return false;
}

/**
 * Detect ShadCN components used in the add-on
 */
function detectShadcnComponents(addonDir) {
  // Check if the UI components directory exists in the project
  const projectUiDir = path.join(projectRoot, "src/app/components/ui");
  if (!fs.existsSync(projectUiDir)) {
    verboseLog("ℹ️", "No ShadCN components directory found in project", colors.blue);
    return null;
  }

  // Get all ShadCN components in the project
  const availableComponents = fs
    .readdirSync(projectUiDir)
    .filter((file) => file.endsWith(".tsx") || file.endsWith(".jsx"))
    .map((file) => path.basename(file, path.extname(file)));

  log(
    "🟡",
    `Available ShadCN components: ${availableComponents.join(", ")}`,
    colors.yellow
  );

  if (availableComponents.length === 0) {
    verboseLog("ℹ️", "No ShadCN components found in project", colors.blue);
    return null;
  }

  verboseLog(
    "🟣",
    `Found ${availableComponents.length} ShadCN components in project: ${availableComponents.join(", ")}`,
    colors.magenta
  );

  // Find all JS/TS files in the add-on
  const jsFiles = [
    ...findFiles(addonDir, [], ".js"),
    ...findFiles(addonDir, [], ".jsx"),
    ...findFiles(addonDir, [], ".ts"),
    ...findFiles(addonDir, [], ".tsx"),
  ];

  verboseLog("🟡", `Scanning JS/TS files: ${jsFiles.join(", ")}`, colors.yellow);
  if (jsFiles.length > 0) {
    const firstFile = jsFiles[0];
    const content = fs.readFileSync(firstFile, "utf8");
    verboseLog(
      "🟡",
      `Content of first JS/TS file (${firstFile}):\n${content.substring(0, 300)}`,
      colors.yellow
    );
  }

  // Check each file for imports of ShadCN components
  const usedComponents = new Set();

  for (const file of jsFiles) {
    const content = fs.readFileSync(file, "utf8");

    // Find all import statements
    const importStatementRegex =
      /import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/gm;
    let match;
    while ((match = importStatementRegex.exec(content)) !== null) {
      const importSpecifiers = match[1];
      const importSource = match[2];

      // Debug log for all imports
      verboseLog("🔵", `Found import in ${file}:`, colors.blue);
      verboseLog("🔵", `  Specifiers: ${importSpecifiers}`, colors.blue);
      verboseLog("🔵", `  Source: ${importSource}`, colors.blue);

      // Only care about sources under components/ui
      if (
        importSource.includes("components/ui/") ||
        importSource.includes("@/components/ui/") ||
        importSource.includes("@/app/components/ui/") ||
        importSource.startsWith("./components/ui/") ||
        importSource.startsWith("../components/ui/") ||
        importSource.match(/\/ui\/[a-zA-Z0-9-]+$/)
      ) {
        verboseLog("🟢", `  Matched UI import in ${file}`, colors.green);
        // For each available ShadCN component, see if it's imported (even aliased)
        for (const component of availableComponents) {
          // Match: Avatar, Avatar as AvatarWrapper, { Avatar, AvatarFallback }, etc.
          const componentRegex = new RegExp(
            `(?:^|\\s|,|\\{)\\s*${component}\\b(?:\\s+as\\s+\\w+)?|\\b${component}\\b`,
            "m"
          );
          if (componentRegex.test(importSpecifiers)) {
            usedComponents.add(component);
            verboseLog(
              "🟣",
              `Detected ShadCN component: ${component} in ${file}`,
              colors.magenta
            );
          }
        }
      }
    }
    
    // Fallback: Line-by-line approach to catch more import patterns
    const lines = content.split("\n");
    for (const line of lines) {
      if (line.includes("import") && 
          (line.includes("/components/ui/") || 
           line.includes("@/components/ui/") || 
           line.includes("@/app/components/ui/"))) {
        
        // Check each component
        for (const component of availableComponents) {
          if (line.includes(component)) {
            usedComponents.add(component);
            verboseLog(
              "🟠",
              `Detected ShadCN component (fallback): ${component} in ${file}`,
              colors.yellow
            );
          }
        }
      }
    }
    
    // Also check for direct usage of the component in JSX
    for (const component of availableComponents) {
      const usageRegex = new RegExp(`<\s*${component}\b`);
      if (usageRegex.test(content)) {
        usedComponents.add(component);
        verboseLog(
          "🟣",
          `Detected ShadCN component (JSX): ${component} in ${file}`,
          colors.magenta
        );
      }
    }
  }

  if (usedComponents.size > 0) {
    log(
      "✅",
      `Detected ${usedComponents.size} ShadCN components used in add-on: ${[...usedComponents].join(", ")}`,
      colors.green
    );
    return [...usedComponents];
  }

  verboseLog("ℹ️", "No ShadCN components used in add-on", colors.blue);
  return null;
}

/**
 * Extract route prefix from route file
 */
function extractRoutePrefix(routeFilePath) {
  if (!routeFilePath) return "";

  const content = fs.readFileSync(routeFilePath, "utf8");

  // Look for common patterns that might indicate a route prefix
  const prefixRegex = /prefix\s*\(\s*['"]([^'"]+)['"]/;
  const routeRegex = /route\s*\(\s*['"]([^'"]+)['"]/g; // Added global flag here

  const prefixMatch = content.match(prefixRegex);
  if (prefixMatch) {
    return prefixMatch[1];
  }

  // If no prefix is found, try to extract from route definitions
  const routes = [];
  let routeMatch;
  while ((routeMatch = routeRegex.exec(content)) !== null) {
    routes.push(routeMatch[1]);
  }

  if (routes.length > 0) {
    // Find common prefix among routes
    const commonPrefix = findCommonPrefix(routes);
    return commonPrefix || "";
  }

  return "";
}

/**
 * Find common prefix among strings
 */
function findCommonPrefix(strings) {
  if (strings.length === 0) return "";
  if (strings.length === 1) return strings[0].split("/")[1] || "";

  const sortedStrings = [...strings].sort();
  const first = sortedStrings[0];
  const last = sortedStrings[sortedStrings.length - 1];

  let i = 0;
  while (i < first.length && first[i] === last[i]) {
    i++;
  }

  const prefix = first.substring(0, i);
  // Extract the first path segment after the leading slash
  const match = prefix.match(/^\/([^\/]+)/);
  return match ? match[1] : "";
}

/**
 * Filter unnecessary packages
 */
function filterPackages(packages, usingShadcn) {
  // Packages to always exclude
  const excludeAlways = [
    "rwsdk",
    "react",
    "@",
    "@redwoodsdk",
    "react-dom",
    "next",
    "next-themes",
    "tailwindcss",
  ];

  // Packages to exclude if using ShadCN
  const excludeWithShadcn = [
    "lucide-react",
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
    "@radix-ui",
  ];

  return packages.filter((pkg) => {
    // Always exclude certain packages
    if (excludeAlways.includes(pkg)) return false;

    // Exclude ShadCN-related packages if using ShadCN
    if (usingShadcn && excludeWithShadcn.includes(pkg)) return false;

    return true;
  });
}

/**
 * Generate addon.jsonc content
 */
function generateAddonConfig(addonName, addonDir) {
  // Find all JavaScript/TypeScript files
  const jsFiles = [
    ...findFiles(addonDir, [], ".js"),
    ...findFiles(addonDir, [], ".jsx"),
    ...findFiles(addonDir, [], ".ts"),
    ...findFiles(addonDir, [], ".tsx"),
  ];

  // Extract imports from all files
  const allImports = new Set();
  for (const file of jsFiles) {
    const imports = extractImports(file);
    imports.forEach((imp) => allImports.add(imp));
  }

  // Extract environment variables
  const envVars = extractEnvVars(addonDir);

  // Find CSS files
  const cssFiles = findCssFiles(addonDir);

  // Find route file
  const routeFile = findRouteFile(addonDir);
  let routePrefix = "";
  if (routeFile) {
    routePrefix = extractRoutePrefix(routeFile.path);
  }

  // Detect ShadCN components
  const shadcnComponents = detectShadcnComponents(addonDir);

  // Create the addon config object
  const addonConfig = {
    name: addonName,
    description: `${addonName} add-on for RWSDK`,
    version: "0.1.0",
  };

  // Add routes if found
  if (routeFile) {
    addonConfig.routes = {
      file: routeFile.file,
      prefix: routePrefix ? `/${routePrefix}` : "",
    };
  }

  // Add packages if found
  if (allImports.size > 0) {
    // Filter out unnecessary packages
    const filteredPackages = filterPackages(
      [...allImports],
      shadcnComponents && shadcnComponents.length > 0
    );

    if (filteredPackages.length > 0) {
      addonConfig.packages = filteredPackages;
      verboseLog(
        "ℹ️",
        `Found ${filteredPackages.length} packages: ${filteredPackages.join(", ")}`,
        colors.blue
      );
    } else {
      verboseLog(
        "ℹ️",
        `No packages needed after filtering ${allImports.size} imports`,
        colors.blue
      );
    }
  }

  // Add environment variables if found
  if (envVars.length > 0) {
    addonConfig.env = envVars;
  }

  // Add ShadCN components if found
  if (shadcnComponents && shadcnComponents.length > 0) {
    addonConfig.shadcn = {
      required: true,
      components: shadcnComponents,
    };
    
    // If ShadCN is used, Tailwind is required
    addonConfig.tailwindcss = {
      required: true
    };
  } else {
    // Check if Tailwind is needed for other reasons
    const needsTailwind = detectTailwindNeeded(addonDir, false);
    if (needsTailwind) {
      addonConfig.tailwindcss = {
        required: true
      };
    }
  }

  // Add styles if found
  if (cssFiles.length > 0) {
    // Use the first CSS file found
    const cssFile = cssFiles[0];
    const relativePath = path.relative(projectRoot, cssFile);

    addonConfig.styles = {
      source: relativePath,
      injectInto: "src/app/styles.css",
      injectDirective: `@import './addons/${addonName}/styles.css';`,
    };
  }

  // Add post-install message
  addonConfig.postInstallMessage = `✅ ${addonName} add-on installed successfully.`;

  return addonConfig;
}

/**
 * Write addon.jsonc file
 */
function writeAddonConfig(addonDir, config) {
  const addonJsoncPath = path.join(addonDir, "addon.jsonc");

  // Convert to JSONC format with comments
  let jsonContent = JSON.stringify(config, null, 2);

  // Add a comment to the styles section if it exists
  if (config.styles) {
    jsonContent = jsonContent.replace(
      /"injectInto": "src\/app\/styles.css"/,
      '"injectInto": "src/app/styles.css",' // Note: Adding comma before the comment
    );

    // Now add the comment after the line with comma
    jsonContent = jsonContent.replace(
      /"injectInto": "src\/app\/styles.css",/,
      '"injectInto": "src/app/styles.css", // project-wide styles file'
    );
  }

  fs.writeFileSync(addonJsoncPath, jsonContent);
  log("✅", `Generated addon.jsonc for ${config.name}`, colors.green);

  return addonJsoncPath;
}

/**
 * Main function to generate addon.jsonc
 */
async function generateAddon(addonName) {
  try {
    log("🔍", `Analyzing add-on: ${addonName}`, colors.blue);

    // The add-on directory is in the current project (source project)
    const addonDir = path.join(projectRoot, "src/app/addons", addonName);

    if (!fs.existsSync(addonDir)) {
      log("❌", `Add-on directory not found: ${addonDir}`, colors.red);
      return false;
    }

    // Generate the addon config
    const addonConfig = generateAddonConfig(addonName, addonDir);

    // Write the addon.jsonc file to the source project
    const addonJsoncPath = writeAddonConfig(addonDir, addonConfig);

    log("✅", `addon.jsonc generated at: ${addonJsoncPath}`, colors.green);
    return true;
  } catch (error) {
    log("❌", `Error generating addon.jsonc: ${error.message}`, colors.red);
    console.error(error);
    return false;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const addonName = args[0];

if (!addonName) {
  log("❌", "Please provide the add-on name", colors.red);
  log("ℹ️", "Usage: node generateAddonConfig.mjs <addonName>", colors.blue);
  process.exit(1);
}

generateAddon(addonName).then((success) => {
  process.exit(success ? 0 : 1);
});
