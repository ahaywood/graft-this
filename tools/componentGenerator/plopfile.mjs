/** @param {import('plop').NodePlopAPI} plop */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function restructureComponent(componentName, componentsDir) {
  const sourcePath = path.join(componentsDir, `${componentName}.tsx`);
  if (!fs.existsSync(sourcePath)) {
    console.log(`Skipping ${componentName}.tsx - file does not exist`);
    return false;
  }

  // Read the content before deleting
  const sourceContent = fs.readFileSync(sourcePath, "utf-8");

  // Create the directory first
  const dirPath = path.join(componentsDir, componentName);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  // Move the file to new location
  const newPath = path.join(dirPath, `${componentName}.tsx`);
  fs.writeFileSync(newPath, sourceContent);

  // Delete the original file
  fs.unlinkSync(sourcePath);
  return true;
}

export default function (plop) {
  // Helper to read template content
  plop.setHelper("readTemplate", (templateName) => {
    return plop
      .getPlopfilePath()
      .replace("plopfile.mjs", `plop-templates/component/${templateName}`);
  });

  // Parse command line arguments before prompts
  const parseCommandLineArgs = () => {
    const args = process.argv.slice(2);
    const options = {};

    // Check for --file flag
    if (args.includes('--file')) {
      options.structure = 'file';
      // If --file is specified, default to no stories and no tests
      // unless explicitly overridden
      if (!args.includes('--stories')) {
        options.withStories = false;
      }
      if (!args.includes('--tests')) {
        options.withTests = false;
      }
    } else if (args.includes('--folder')) {
      options.structure = 'folder';
    }

    // Check for stories flags
    if (args.includes('--stories')) {
      options.withStories = true;
    } else if (args.includes('--no-stories')) {
      options.withStories = false;
    }

    // Check for tests flags
    if (args.includes('--tests')) {
      options.withTests = true;
    } else if (args.includes('--no-tests')) {
      options.withTests = false;
    }

    // Check for withRoutes flags
    if (args.includes('--withRoutes')) {
      options.withRoutes = true;
    } else if (args.includes('--no-withRoutes')) {
      options.withRoutes = false;
    }

    return options;
  };

  // Get command line arguments
  const cmdArgs = parseCommandLineArgs();

  // Keep the action type for backward compatibility
  plop.setActionType('parseArgs', function (answers, config) {
    return 'Args parsed';
  });

  // Custom action to add page routes to worker
  plop.setActionType('addPageRoutesToWorker', function (answers, config) {
    const workerPath = path.join(process.cwd(), 'src/worker.tsx');

    if (!fs.existsSync(workerPath)) {
      throw new Error('worker.tsx file not found');
    }

    const workerContent = fs.readFileSync(workerPath, 'utf-8');
    const pageName = answers.name;
    // Convert to camelCase and add Routes suffix (e.g., HomePage -> homePageRoutes)
    const routesImportName = pageName.charAt(0).toLowerCase() + pageName.slice(1) + 'Routes';

    // Create import statement
    const importStatement = `import { ${routesImportName} } from "@/app/pages/${pageName}/routes"`;

    // Check if import already exists
    if (workerContent.includes(importStatement)) {
      return 'Routes already added to worker';
    }

    let updatedContent = workerContent;

    // Add import after existing route imports
    const importRegex = /import { [^}]+ } from "@\/app\/pages\/[^"]+\/routes"/g;
    const imports = workerContent.match(importRegex);

    if (imports && imports.length > 0) {
      // Find the last route import and add after it
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = workerContent.lastIndexOf(lastImport);
      const insertIndex = lastImportIndex + lastImport.length;
      updatedContent = workerContent.slice(0, insertIndex) + '\n' + importStatement + workerContent.slice(insertIndex);
    } else {
      // Add after other imports (look for user routes import)
      const userRoutesImport = 'import { userRoutes } from "@/app/pages/user/routes"';
      if (workerContent.includes(userRoutesImport)) {
        updatedContent = workerContent.replace(userRoutesImport, userRoutesImport + '\n' + importStatement);
      }
    }    // Add routes to the render array - look for the pattern where homePageRoutes is spread
    const renderArrayRegex = /(prefix\("\/user", userRoutes\),\s*)(\.\.\..*PageRoutes,\s*)(\]\),)/s;
    const match = updatedContent.match(renderArrayRegex);

    if (match) {
      // Add after existing homePageRoutes
      const replacement = `${match[1]}${match[2]}...${routesImportName},\n    ${match[3]}`;
      updatedContent = updatedContent.replace(renderArrayRegex, replacement);
    } else {
      // Fallback: look for pattern without existing homePageRoutes and add after userRoutes
      const fallbackRegex = /(prefix\("\/user", userRoutes\),\s*)(\]\),)/s;
      const fallbackMatch = updatedContent.match(fallbackRegex);
      if (fallbackMatch) {
        const replacement = `${fallbackMatch[1]}...${routesImportName},\n    ${fallbackMatch[2]}`;
        updatedContent = updatedContent.replace(fallbackRegex, replacement);
      }
    }

    fs.writeFileSync(workerPath, updatedContent);
    return `Added ${pageName} routes to worker`;
  });


  // Create new component
  plop.setGenerator("component", {
    description: "Create a new component with optional stories and tests",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component name:",
        validate: (value) => {
          if (/.+/.test(value)) return true;
          return "Component name is required";
        }
      },
      {
        type: "list",
        name: "structure",
        message: "Component structure:",
        choices: [
          { name: "Folder structure (component in its own folder)", value: "folder" },
          { name: "Single file (no folder)", value: "file" }
        ],
        default: "folder",
        when: (answers) => {
          // Skip if structure was set by command line args
          return cmdArgs.structure === undefined;
        }
      },
      {
        type: "confirm",
        name: "withStories",
        message: "Generate Storybook file?",
        default: true,
        when: (answers) => {
          // Skip if withStories was set by command line args
          return cmdArgs.withStories === undefined;
        }
      },
      {
        type: "confirm",
        name: "withTests",
        message: "Generate test file?",
        default: true,
        when: (answers) => {
          // Skip if withTests was set by command line args
          return cmdArgs.withTests === undefined;
        }
      }
    ],
    // Apply command line arguments to the answers
    skipPrompts: Object.keys(cmdArgs).length > 0,
    skipActionsOnSkippedPrompts: false,
    actions: function (data) {
      // Apply command line arguments to the data
      Object.assign(data, cmdArgs);

      const actions = [];

      if (data.structure === "folder") {
        // Add component in folder
        actions.push({
          type: "add",
          path: "src/app/components/{{name}}/{{name}}.tsx",
          templateFile: "plop-templates/component/component.hbs",
        });

        // Add index file for folder structure
        actions.push({
          type: "add",
          path: "src/app/components/{{name}}/index.ts",
          templateFile: "plop-templates/component/index.hbs",
        });

        // Conditionally add stories
        if (data.withStories) {
          actions.push({
            type: "add",
            path: "src/app/components/{{name}}/{{name}}.stories.tsx",
            templateFile: "plop-templates/component/stories.hbs",
          });
        }

        // Conditionally add tests
        if (data.withTests) {
          actions.push({
            type: "add",
            path: "src/app/components/{{name}}/{{name}}.test.tsx",
            templateFile: "plop-templates/component/test.hbs",
          });
        }
      } else {
        // Add component as single file
        actions.push({
          type: "add",
          path: "src/app/components/{{name}}.tsx",
          templateFile: "plop-templates/component/component.hbs",
        });

        // Conditionally add stories as single file
        if (data.withStories) {
          actions.push({
            type: "add",
            path: "src/app/components/{{name}}.stories.tsx",
            templateFile: "plop-templates/component/stories.hbs",
          });
        }

        // Conditionally add tests as single file
        if (data.withTests) {
          actions.push({
            type: "add",
            path: "src/app/components/{{name}}.test.tsx",
            templateFile: "plop-templates/component/test.hbs",
          });
        }
      }

      return actions;
    }
  });

  // Create new page component
  plop.setGenerator("page", {
    description: "Create a new page page with optional stories, tests, and routes",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Page name:",
        validate: (value) => {
          if (/.+/.test(value)) return true;
          return "Page name is required";
        }
      },
      {
        type: "list",
        name: "structure",
        message: "Page structure:",
        choices: [
          { name: "Folder structure (page in its own folder)", value: "folder" },
          { name: "Single file (no folder)", value: "file" }
        ],
        default: "folder",
        when: (answers) => {
          // Skip if structure was set by command line args
          return cmdArgs.structure === undefined;
        }
      },
      {
        type: "confirm",
        name: "withStories",
        message: "Generate Storybook file?",
        default: true,
        when: (answers) => {
          // Skip if withStories was set by command line args
          return cmdArgs.withStories === undefined;
        }
      },
      {
        type: "confirm",
        name: "withTests",
        message: "Generate test file?",
        default: true,
        when: (answers) => {
          // Skip if withTests was set by command line args
          return cmdArgs.withTests === undefined;
        }
      },
      {
        type: "confirm",
        name: "withRoutes",
        message: "Generate routes file?",
        default: true,
      },
      {
        type: "confirm",
        name: "addPageRoutesToWorker",
        message: "Add routes to worker?",
        default: true,
      },

    ],
    // Apply command line arguments to the answers
    skipPrompts: Object.keys(cmdArgs).length > 0,
    skipActionsOnSkippedPrompts: false,
    actions: function (data) {
      // Apply command line arguments to the data
      Object.assign(data, cmdArgs);

      const actions = [];

      if (data.structure === "folder") {
        // Add page in folder
        actions.push({
          type: "add",
          path: "src/app/pages/{{name}}/{{name}}.tsx",
          templateFile: "plop-templates/page/page.hbs",
        });

        // Add index file for folder structure
        actions.push({
          type: "add",
          path: "src/app/pages/{{name}}/index.ts",
          templateFile: "plop-templates/page/index.hbs",
        });

        // Conditionally add stories
        if (data.withStories) {
          actions.push({
            type: "add",
            path: "src/app/pages/{{name}}/{{name}}.stories.tsx",
            templateFile: "plop-templates/page/stories.hbs",
          });
        }

        // Conditionally add tests
        if (data.withTests) {
          actions.push({
            type: "add",
            path: "src/app/pages/{{name}}/{{name}}.test.tsx",
            templateFile: "plop-templates/page/test.hbs",
          });
        }

        // Conditionally add routes
        if (data.withRoutes) {
          actions.push({
            type: "add",
            path: "src/app/pages/{{name}}/routes.ts",
            templateFile: "plop-templates/page/routes.hbs",
          });
        }

        // Conditionally add routes to worker for folder structure
        if (data.addPageRoutesToWorker && data.withRoutes) {
          actions.push({
            type: "addPageRoutesToWorker",
            data: data
          });
        }
      } else {
        // Add page as single file
        actions.push({
          type: "add",
          path: "src/app/pages/{{name}}.tsx",
          templateFile: "plop-templates/page/page.hbs",
        });

        // Conditionally add stories as single file
        if (data.withStories) {
          actions.push({
            type: "add",
            path: "src/app/pages/{{name}}.stories.tsx",
            templateFile: "plop-templates/page/stories.hbs",
          });
        }

        // Conditionally add tests as single file
        if (data.withTests) {
          actions.push({
            type: "add",
            path: "src/app/pages/{{name}}.test.tsx",
            templateFile: "plop-templates/page/test.hbs",
          });
        }

        // Conditionally add routes as single file
        if (data.withRoutes) {
          actions.push({
            type: "add",
            path: "src/app/pages/{{name}}.routes.ts",
            templateFile: "plop-templates/page/routes.hbs",
          });
        }
      }

      // Conditionally add routes to worker
      if (data.addPageRoutesToWorker && data.withRoutes) {
        actions.push({
          type: "addPageRoutesToWorker",
          data: data
        });
      }

      return actions;
    }
  });

  // Restructure existing component
  plop.setGenerator("restructure", {
    description: "Restructure an existing component into its own folder",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component name to restructure:",
      },
    ],
    actions: (data) => {
      const sourcePath = path.join(
        process.cwd(),
        "src/app/components",
        `${data.name}.tsx`
      );
      if (!fs.existsSync(sourcePath)) {
        throw new Error(`Component ${data.name}.tsx does not exist`);
      }

      // Read the content before deleting
      const sourceContent = fs.readFileSync(sourcePath, "utf-8");

      // Create the directory first
      const dirPath = path.join(process.cwd(), "src/app/components", data.name);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }

      // Move the file to new location
      const newPath = path.join(dirPath, `${data.name}.tsx`);
      fs.writeFileSync(newPath, sourceContent);

      // Delete the original file
      fs.unlinkSync(sourcePath);

      return [
        {
          type: "add",
          path: "src/app/components/{{name}}/{{name}}.stories.tsx",
          force: true,
          templateFile: "plop-templates/component/stories.hbs",
        },
        {
          type: "add",
          path: "src/app/components/{{name}}/{{name}}.test.tsx",
          force: true,
          templateFile: "plop-templates/component/test.hbs",
        },
        {
          type: "add",
          path: "src/app/components/{{name}}/index.ts",
          force: true,
          templateFile: "plop-templates/component/index.hbs",
        },
      ];
    },
  });

  // Batch restructure all components in a directory
  plop.setGenerator("restructure-all", {
    description: "Restructure all components in a directory",
    prompts: [
      {
        type: "input",
        name: "directory",
        message: "Directory to restructure (relative to src/app/components):",
        default: "",
      },
    ],
    actions: (data) => {
      const componentsDir = path.join(
        process.cwd(),
        "src/app/components",
        data.directory
      );
      const files = fs.readdirSync(componentsDir);

      const componentFiles = files.filter(
        (file) =>
          file.endsWith(".tsx") &&
          !file.includes(".test.tsx") &&
          !file.includes(".stories.tsx") &&
          fs.statSync(path.join(componentsDir, file)).isFile()
      );

      const components = componentFiles.map((file) =>
        path.basename(file, ".tsx")
      );
      const restructuredComponents = [];

      for (const component of components) {
        if (restructureComponent(component, componentsDir)) {
          restructuredComponents.push(component);
        }
      }

      const actions = [];
      for (const component of restructuredComponents) {
        actions.push(
          {
            type: "add",
            path: path.join(
              "src/app/components",
              data.directory,
              component,
              `${component}.stories.tsx`
            ),
            force: true,
            templateFile: "plop-templates/component/stories.hbs",
            data: { name: component },
          },
          {
            type: "add",
            path: path.join(
              "src/app/components",
              data.directory,
              component,
              `${component}.test.tsx`
            ),
            force: true,
            templateFile: "plop-templates/component/test.hbs",
            data: { name: component },
          },
          {
            type: "add",
            path: path.join(
              "src/app/components",
              data.directory,
              component,
              "index.ts"
            ),
            force: true,
            templateFile: "plop-templates/component/index.hbs",
            data: { name: component },
          }
        );
      }

      console.log(
        `\nRestructured ${restructuredComponents.length} components:`
      );
      restructuredComponents.forEach((comp) => console.log(`- ${comp}`));

      return actions;
    },
  });
}