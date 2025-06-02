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
      execSync("npx rwsdk-tools tailwind", { stdio: "inherit" });
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
      
      // Define the ShadCN styles content
      const shadcnStyles = `@import "tw-animate-css";

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

      // Check if the directory exists, create it if not
      if (!fs.existsSync(stylesDir)) {
        fs.mkdirSync(stylesDir, { recursive: true });
      }
      
      let finalStylesContent = '';
      
      // Check if the styles.css file already exists
      if (fs.existsSync(stylesPath)) {
        // Read the existing content
        const existingContent = await readFile(stylesPath, 'utf8');
        
        // Check if the file already has the tailwind import
        if (existingContent.includes('@import "tailwindcss"')) {
          // Check if it already has the shadcn styles
          if (existingContent.includes('@custom-variant dark (&:is(.dark *))') || 
              existingContent.includes('--sidebar-ring: oklch(0.708 0 0)')) {
            console.log('✅ ShadCN styles already exist in styles.css');
            finalStylesContent = existingContent;
          } else {
            // Insert the shadcn styles after the tailwind import
            const tailwindImportIndex = existingContent.indexOf('@import "tailwindcss"');
            const endOfLineIndex = existingContent.indexOf('\n', tailwindImportIndex);
            
            if (endOfLineIndex !== -1) {
              // Insert after the line with tailwind import
              finalStylesContent = 
                existingContent.substring(0, endOfLineIndex + 1) + 
                shadcnStyles + 
                existingContent.substring(endOfLineIndex + 1);
              console.log('✅ Added ShadCN styles after Tailwind import in existing styles.css');
            } else {
              // If we can't find the end of the line, append to the end
              finalStylesContent = existingContent + '\n' + shadcnStyles;
              console.log('✅ Appended ShadCN styles to existing styles.css');
            }
          }
        } else {
          // No tailwind import found, add it along with shadcn styles
          finalStylesContent = '@import "tailwindcss";\n' + shadcnStyles + '\n\n' + existingContent;
          console.log('✅ Added Tailwind import and ShadCN styles to existing styles.css');
        }
      } else {
        // File doesn't exist, create it with tailwind import and shadcn styles
        finalStylesContent = '@import "tailwindcss";\n' + shadcnStyles;
        console.log('✅ Created new styles.css file with Tailwind import and ShadCN styles');
      }
      
      // Write the final content to the file
      await writeFile(stylesPath, finalStylesContent);
      console.log('✅ Updated styles.css successfully');
      
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

    // Step 3: Display success message and next steps

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
