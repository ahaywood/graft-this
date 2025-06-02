#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';

interface RouteMatch {
  route: string;
  startIndex: number;
  endIndex: number;
}

interface ImportInfo {
  originalName?: string;
  path: string;
  isRouteFile?: boolean;
}

async function findMatchingBracket(content: string, startIndex: number): Promise<number> {
  let count = 1;
  let i = startIndex;

  while (count > 0 && i < content.length) {
    if (content[i] === '[') count++;
    if (content[i] === ']') count--;
    i++;
  }

  return i - 1;
}

async function resolveImportPath(importPath: string, currentFilePath?: string): Promise<string> {
  // Convert relative path to absolute
  let absolutePath = importPath;
  if (importPath.startsWith('@/')) {
    absolutePath = path.join(process.cwd(), 'src', importPath.slice(2));
  } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
    const basePath = currentFilePath ? path.dirname(currentFilePath) : process.cwd();
    absolutePath = path.join(basePath, importPath);
  }

  // Try different extensions if no extension is provided
  if (!absolutePath.endsWith('.ts') && !absolutePath.endsWith('.tsx')) {
    // Try .ts extension first
    try {
      await fs.access(absolutePath + '.ts');
      return absolutePath + '.ts';
    } catch (error) {
      // Try .tsx extension
      try {
        await fs.access(absolutePath + '.tsx');
        return absolutePath + '.tsx';
      } catch (error) {
        // If both fail, return the original path with .ts extension
        return absolutePath + '.ts';
      }
    }
  }

  return absolutePath;
}

async function findImportedRoutes(content: string, filePath?: string): Promise<string[]> {
  const importRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*["']([^"']+)["']/g;
  const spreadRegex = /\.\.\.([\w]+)\s*,?/g;
  const prefixVarRegex = /prefix\(\s*["']([^"']+)["']\s*,\s*([\w]+)\s*\)/g;
  const importedRoutes: string[] = [];
  let match;

  // Find all imports
  const imports = new Map<string, ImportInfo>();
  while ((match = importRegex.exec(content)) !== null) {
    const [, importNames, importPath] = match;
    const names = importNames.split(',').map(n => n.trim());

    for (const name of names) {
      if (name.includes(' as ')) {
        const [originalName, alias] = name.split(' as ').map(n => n.trim());
        imports.set(alias, { originalName, path: importPath });
      } else {
        imports.set(name, { path: importPath });
      }
    }
  }

  // Process spread operators (both inside arrays and directly in the render function)
  while ((match = spreadRegex.exec(content)) !== null) {
    const variableName = match[1];
    const importInfo = imports.get(variableName);

    if (importInfo) {
      try {
        const absolutePath = await resolveImportPath(importInfo.path, filePath);
        const importedContent = await fs.readFile(absolutePath, 'utf-8');
        const newRoutes = await extractRoutesFromContent(importedContent, '', absolutePath);
        importedRoutes.push(...newRoutes);
      } catch (error) {
        console.warn(`Warning: Could not process imported routes from ${importInfo.path}:`, error);
      }
    }
  }

  // Process prefix with variable references (e.g., prefix("/user", userRoutes))
  while ((match = prefixVarRegex.exec(content)) !== null) {
    const prefixPath = match[1];
    const variableName = match[2];
    const importInfo = imports.get(variableName);

    if (importInfo) {
      try {
        const absolutePath = await resolveImportPath(importInfo.path, filePath);
        const importedContent = await fs.readFile(absolutePath, 'utf-8');
        const newRoutes = await extractRoutesFromContent(importedContent, prefixPath, absolutePath);
        importedRoutes.push(...newRoutes);
      } catch (error) {
        console.warn(`Warning: Could not process imported routes from ${importInfo.path} with prefix ${prefixPath}:`, error);
      }
    }
  }

  return importedRoutes;
}

async function extractRoutesFromContent(content: string, prefix = '', filePath?: string): Promise<string[]> {
  const routes: string[] = [];
  const routeRegex = /route\("([^"]+)"/g;
  const indexRegex = /index\(/g;
  const prefixRegex = /prefix\("([^"]+)",\s*\[/g;

  let match;

  // Process imported routes first
  const importedRoutes = await findImportedRoutes(content, filePath);
  routes.push(...importedRoutes);

  // Find all prefixed route blocks
  while ((match = prefixRegex.exec(content)) !== null) {
    const prefixPath = match[1];
    const startIndex = match.index + match[0].length;
    const endIndex = await findMatchingBracket(content, startIndex);
    const nestedContent = content.substring(startIndex, endIndex);

    // Recursively process nested routes with combined prefix
    const nestedRoutes = await extractRoutesFromContent(
      nestedContent,
      prefix + prefixPath,
      filePath
    );
    routes.push(...nestedRoutes);
  }

  // Find all regular routes
  while ((match = routeRegex.exec(content)) !== null) {
    // Skip if this route is part of a prefix block (we already processed those)
    const beforeMatch = content.substring(0, match.index);
    const lastPrefixIndex = beforeMatch.lastIndexOf('prefix(');
    const lastBracketIndex = beforeMatch.lastIndexOf(']');

    if (lastPrefixIndex === -1 || lastBracketIndex > lastPrefixIndex) {
      const route = prefix + match[1];
      routes.push(route);
    }
  }

  // Find index routes (which map to "/")
  if (indexRegex.test(content)) {
    routes.push(prefix + "/");
  }

  // Remove duplicates
  return [...new Set(routes)];
}

async function generateLinksFile(routes: string[]) {
  const content = `import { defineLinks } from "rwsdk/router";

export const link = defineLinks(${JSON.stringify(routes, null, 2)});
`;

  await fs.writeFile(
    path.resolve(process.cwd(), 'src/app/shared/links.ts'),
    content,
    'utf-8'
  );
}

async function main() {
  try {
    const workerPath = path.resolve(process.cwd(), 'src/worker.tsx');
    const workerContent = await fs.readFile(workerPath, 'utf-8');

    const routes = await extractRoutesFromContent(workerContent, '', workerPath);
    await generateLinksFile(routes);
    console.log('✨ Successfully generated links.ts');
  } catch (error) {
    console.error('Error generating routes:', error);
    process.exit(1);
  }
}

main();