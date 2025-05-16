#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/**
 * Setup shadcn for a RedwoodSDK project
 */
async function setupShadcn() {
  console.log("🔨 Setting up shadcn for your RedwoodSDK project...");

  try {
    // Step 0: Copy components.json to the project root
    console.log("📋 Copying components.json configuration...");
    const componentsJsonSource = path.join(__dirname, "components.json");
    const componentsJsonDest = path.join(process.cwd(), "components.json");

    try {
      fs.copyFileSync(componentsJsonSource, componentsJsonDest);
      console.log("✅ components.json copied to project root");
    } catch (error) {
      console.error("❌ Error copying components.json:", error.message);
    }

    // Step 1: Check if tailwind is already installed
    console.log("📋 Checking if Tailwind is installed...");
    let tailwindInstalled = false;

    try {
      const packageJsonPath = path.resolve(process.cwd(), "package.json");
      const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));

      // Check if tailwind packages are in dependencies or devDependencies
      const allDeps = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
      };

      tailwindInstalled =
        allDeps["tailwindcss"] && allDeps["@tailwindcss/vite"];
    } catch (error) {
      console.log(
        "⚠️ Could not check package.json, assuming Tailwind is not installed."
      );
    }

    if (!tailwindInstalled) {
      console.log("🌬️ Tailwind not found. Installing Tailwind...");
      execSync("npx graftthis tailwind", { stdio: "inherit" });
      console.log("✅ Tailwind installed successfully!");
    } else {
      console.log("✅ Tailwind is already installed.");
    }

    // Step 2: Manually set up shadcn (without using the CLI init command)
    console.log('📋 Setting up shadcn manually...');
    
    try {
      // Install necessary dependencies for shadcn
      console.log('💾 Installing shadcn dependencies...');
      execSync('pnpm add class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-slot tw-animate-css', { stdio: 'inherit' });
      
      // Create the lib directory and utils.ts file
      console.log('📂 Creating lib directory and utility files...');
      const libDir = path.join(process.cwd(), 'src', 'app', 'lib');
      if (!fs.existsSync(libDir)) {
        fs.mkdirSync(libDir, { recursive: true });
      }
      
      // Create the cn.ts utility file
      const cnUtilPath = path.join(libDir, 'utils.ts');
      const cnUtilContent = `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;
      
      await writeFile(cnUtilPath, cnUtilContent);
      console.log('✅ Created utils.ts with cn helper function');
      
      // Set up the CSS file
      console.log('📝 Setting up styles.css...');
      const stylesDir = path.join(process.cwd(), 'src', 'app');
      const stylesPath = path.join(stylesDir, 'styles.css');
      
      const stylesContent = `@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: oklch(0.439 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;
      
      await writeFile(stylesPath, stylesContent);
      console.log('✅ Created styles.css with shadcn styles');
      
      // Update Document.tsx to include the styles
      console.log('📝 Updating Document.tsx...');
      const documentPath = path.join(process.cwd(), 'src', 'app', 'Document.tsx');
      
      if (fs.existsSync(documentPath)) {
        try {
          let documentContent = await readFile(documentPath, 'utf8');
          let modified = false;
          
          // Check if styles are already imported
          if (!documentContent.includes("import styles from './styles.css?url'")) {
            // Always add the import statement at the very top of the file, regardless of content
            documentContent = `import styles from './styles.css?url';\n\n${documentContent}`;
            console.log('✅ Added styles import to Document.tsx');
            modified = true;
          } else {
            console.log('✅ Styles import already exists in Document.tsx');
          }
          
          // Check if the link tag is already in the head
          if (!documentContent.includes('<link rel="stylesheet" href={styles}')) {
            // Add the link tag to the head
            if (documentContent.includes('<head>')) {
              documentContent = documentContent.replace(
                /<head>(\s*)/,
                '<head>$1<link rel="stylesheet" href={styles} />$1'
              );
              console.log('✅ Added stylesheet link to Document.tsx');
              modified = true;
            } else {
              console.log('⚠️ Could not find <head> tag in Document.tsx');
            }
          } else {
            console.log('✅ Stylesheet link already exists in Document.tsx');
          }
          
          // Write the updated Document.tsx file only if changes were made
          if (modified) {
            await writeFile(documentPath, documentContent);
            console.log('✅ Successfully updated Document.tsx');
          } else {
            console.log('ℹ️ No changes needed for Document.tsx');
          }
          
          // Double-check that the import statement was added
          const updatedContent = await readFile(documentPath, 'utf8');
          if (!updatedContent.includes("import styles from './styles.css?url'")) {
            console.log('⚠️ Warning: Import statement was not added to Document.tsx. Trying alternative method...');
            
            // Try a more direct approach
            const lines = updatedContent.split('\n');
            lines.unshift(`import styles from './styles.css?url';`);
            await writeFile(documentPath, lines.join('\n'));
            console.log('✅ Added styles import using alternative method');
          }
        } catch (error) {
          console.error('❌ Error updating Document.tsx:', error.message);
        }
      } else {
        console.error('❌ Document.tsx not found at', documentPath);
      }
      
      console.log('✅ shadcn manual setup completed successfully!');
    } catch (error) {
      console.error('❌ Error setting up shadcn manually:', error.message);
      console.log('⚠️ You may need to manually install dependencies: pnpm add class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-slot tw-animate-css');
    }

    // Step 3: Update tsconfig.json with baseUrl
    console.log('📝 Updating tsconfig.json...');
    const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json');
    
    try {
      // Read the file content first
      const tsconfigContent = await readFile(tsconfigPath, 'utf8');
      
      try {
        // Try to parse the JSON
        const tsconfig = JSON.parse(tsconfigContent);
        
        if (!tsconfig.compilerOptions) {
          tsconfig.compilerOptions = {};
        }
        
        if (!tsconfig.compilerOptions.baseUrl) {
          tsconfig.compilerOptions.baseUrl = '.';
          await writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
          console.log('✅ Added baseUrl to tsconfig.json');
        } else {
          console.log('✅ baseUrl already exists in tsconfig.json');
        }
      } catch (parseError) {
        // If JSON parsing fails, try a regex approach
        console.log('⚠️ Could not parse tsconfig.json as JSON, trying alternative approach...');
        
        // Check if compilerOptions exists
        if (tsconfigContent.includes('"compilerOptions"') || tsconfigContent.includes('"compilerOptions":')) {
          // Check if baseUrl already exists
          if (!tsconfigContent.includes('"baseUrl"') && !tsconfigContent.includes('"baseUrl":')) {
            // Find the position after compilerOptions opening brace
            const compilerOptionsPos = tsconfigContent.indexOf('compilerOptions');
            if (compilerOptionsPos !== -1) {
              const openBracePos = tsconfigContent.indexOf('{', compilerOptionsPos);
              if (openBracePos !== -1) {
                // Insert baseUrl after the opening brace
                const updatedContent = 
                  tsconfigContent.slice(0, openBracePos + 1) + 
                  '\n    "baseUrl": ".",' + 
                  tsconfigContent.slice(openBracePos + 1);
                
                await writeFile(tsconfigPath, updatedContent);
                console.log('✅ Added baseUrl to tsconfig.json using text insertion');
              } else {
                throw new Error('Could not find compilerOptions opening brace');
              }
            } else {
              throw new Error('Could not find compilerOptions section');
            }
          } else {
            console.log('✅ baseUrl already exists in tsconfig.json');
          }
        } else {
          // If compilerOptions doesn't exist, create a minimal valid structure
          const minimalTsConfig = {
            compilerOptions: {
              baseUrl: '.'
            }
          };
          
          // Preserve any existing content by wrapping it
          console.log('⚠️ Creating new compilerOptions section with baseUrl');
          await writeFile(tsconfigPath, JSON.stringify(minimalTsConfig, null, 2));
          console.log('✅ Created new tsconfig.json with baseUrl');
        }
      }
    } catch (error) {
      console.error('❌ Error updating tsconfig.json:', error.message);
      console.log('⚠️ You may need to manually add "baseUrl": "." to your compilerOptions in tsconfig.json');
    }

    // Step 4: Update Vite config with resolve alias
    console.log('📝 Updating Vite configuration...');
    
    // Check for different possible Vite config filenames
    const possibleViteConfigPaths = [
      path.resolve(process.cwd(), 'vite.config.ts'),
      path.resolve(process.cwd(), 'vite.config.js'),
      path.resolve(process.cwd(), 'vite.config.mts'),
      path.resolve(process.cwd(), 'vite.config.mjs')
    ];
    
    let viteConfigPath = null;
    for (const configPath of possibleViteConfigPaths) {
      if (fs.existsSync(configPath)) {
        viteConfigPath = configPath;
        break;
      }
    }
    
    if (viteConfigPath) {
      console.log(`📝 Found Vite config at ${path.basename(viteConfigPath)}`);
      try {
        let viteConfig = await readFile(viteConfigPath, 'utf8');
        
        // Check if the alias is already configured
        if (!viteConfig.includes('alias: {') && !viteConfig.includes('@": path.resolve')) {
          // Import path if not already imported
          if (!viteConfig.includes("import path from 'path'") && !viteConfig.includes('import path from "path"')) {
            // Check if there are any imports
            if (viteConfig.includes('import ')) {
              viteConfig = viteConfig.replace(
                /import .* from .*/,
                match => `import path from 'path';\n${match}`
              );
            } else {
              // No imports found, add at the beginning
              viteConfig = `import path from 'path';\n${viteConfig}`;
            }
          }
          
          // Add resolve alias configuration
          if (viteConfig.includes('export default defineConfig({')) {
            viteConfig = viteConfig.replace(
              'export default defineConfig({',
              `export default defineConfig({\n  resolve: {\n    alias: {\n      "@": path.resolve(__dirname, "./src"),\n    },\n  },`
            );
          } else if (viteConfig.includes('export default {')) {
            viteConfig = viteConfig.replace(
              'export default {',
              `export default {\n  resolve: {\n    alias: {\n      "@": path.resolve(__dirname, "./src"),\n    },\n  },`
            );
          } else {
            console.log('⚠️ Could not find defineConfig or export default in Vite config. Please add the resolve alias manually.');
          }
          
          await writeFile(viteConfigPath, viteConfig);
          console.log('✅ Added resolve alias to Vite config');
        } else {
          console.log('✅ Resolve alias already exists in Vite config');
        }
      } catch (error) {
        console.error('❌ Error updating Vite config:', error.message);
      }
    } else {
      console.log('⚠️ No Vite config file found. Creating a basic vite.config.ts file...');
      
      // Create a basic vite.config.ts file
      const basicViteConfig = `import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
`;
      
      const newViteConfigPath = path.resolve(process.cwd(), 'vite.config.ts');
      try {
        await writeFile(newViteConfigPath, basicViteConfig);
        console.log('✅ Created a new vite.config.ts file with resolve alias configuration');
      } catch (error) {
        console.error('❌ Error creating vite.config.ts:', error.message);
        console.log('⚠️ Please create a vite.config.ts file manually with the following content:');
        console.log(basicViteConfig);
      }
    }

    // Step 5: Display success message and next steps
    console.log("\n🎉 shadcn setup complete!");
    console.log("\n📄 components.json has been added to your project root");
    console.log("\n📦 You can now add components using:");
    console.log("\n   To add components in bulk:");
    console.log("   pnpm dlx shadcn@latest add");
    console.log("\n   To add a single component:");
    console.log("   pnpm dlx shadcn@latest add <COMPONENT-NAME>");
    console.log(
      "\n   Components will be added to the src/app/components/ui folder as configured in components.json."
    );
  } catch (error) {
    console.error("❌ An error occurred during setup:", error);
    process.exit(1);
  }
}

// Run the setup function
setupShadcn();
