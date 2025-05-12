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

  // Create new component
  plop.setGenerator("component", {
    description: "Create a new component with stories and tests",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component name:",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/app/components/{{name}}/{{name}}.tsx",
        templateFile: "plop-templates/component/component.hbs",
      },
      {
        type: "add",
        path: "src/app/components/{{name}}/{{name}}.stories.tsx",
        templateFile: "plop-templates/component/stories.hbs",
      },
      {
        type: "add",
        path: "src/app/components/{{name}}/{{name}}.test.tsx",
        templateFile: "plop-templates/component/test.hbs",
      },
      {
        type: "add",
        path: "src/app/components/{{name}}/index.ts",
        templateFile: "plop-templates/component/index.hbs",
      },
    ],
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