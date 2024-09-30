#!/usr/bin/env node
const ts = require("typescript");
const glob = require("glob");
const path = require("path");
const fs = require("fs");
const fetch = require("npm-registry-fetch");

function checkTypes(packageName) {
  // Fetching package metadata from the npm registry
  return fetch(`https://registry.npmjs.org/${packageName}`)
    .then((response) => response.json())
    .then((data) => {
      // Look for the latest version key
      const latestVersion = data["dist-tags"].latest;
      const latestData = data.versions[latestVersion];

      // Check if 'types' or 'typings' field exists
      if (latestData.types || latestData.typings) {
        return true;
      } else {
        return false;
      }
    })
    .catch((error) => {
      console.error("Error fetching package data:", error);
    });
}

function extractPackageName(importString) {
  // Regular expression to match both scoped and non-scoped package names
  const packageNameRegex = /^(@[^\/]+\/[^\/]+|[^\/]+)/;

  // Apply the regex to extract the package name
  const match = importString.match(packageNameRegex);
  if (match) {
    return match[0];
  } else {
    return null; // or throw an error depending on how you want to handle no matches
  }
}
function getLatestVersion(packageName) {
  // Fetching package metadata from the npm registry
  return fetch(`https://registry.npmjs.org/${packageName}/latest`)
    .then((response) => response.json())
    .then((data) => {
      //console.log(`Latest version of ${packageName} is: ${data.version}`);
      return data.version;
    });
}

if (!process.argv[2]) {
  console.error(
    "Please provide a path to the directory containing TypeScript files",
  );
  process.exit(1);
}
// Path to the directory containing TypeScript files
const DIRECTORY_PATH = `${process.argv[2]}/**/*.ts*`;

// Helper function to parse TypeScript file and extract external module names
function extractImports(filePath) {
  const fileContents = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContents,
    ts.ScriptTarget.ES2015,
    true,
  );

  const imports = [];
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
      const specifier = node.moduleSpecifier.text;
      if (specifier.startsWith(".") === false) {
        // Filter out relative imports
        imports.push(specifier);
      }
    }
  });
  return imports;
}

// Read all TypeScript files and extract imports
glob(DIRECTORY_PATH, async (err, files) => {
  if (err) {
    console.error("Error finding files", err);
    return;
  }

  const allImports = new Set();
  files.forEach((file) => {
    const imports = extractImports(file);
    imports.forEach((imp) => {
      const packageName = extractPackageName(imp);
      allImports.add(packageName);
    });
  });
  const convertToTypesPackageName = (name) =>
    `@types/${name.replace(/^@([^\/]+)\/(.+)$/, "$1__$2").replace(/\/$/, "")}`;

  const filteredImports = Array.from(allImports).filter(
    (imp) => !imp.startsWith("@slub"),
  );
  const workspaceImports = Array.from(allImports).filter((imp) =>
    imp.startsWith("@slub"),
  );

  const dependenciesWithInfo = await Promise.all(
    filteredImports.map(async (dep) => {
      const version = await getLatestVersion(dep);
      const hasTypes = await checkTypes(dep);
      let devDependency = null;
      if (!hasTypes) {
        const typesPackage = convertToTypesPackageName(dep);
        try {
          const typesVersion = await getLatestVersion(typesPackage);
          devDependency = { dep: typesPackage, version: typesVersion };
        } catch (e) {}
      }
      return { dep, version, hasTypes, devDependency };
    }),
  );

  const dependencies = Object.fromEntries([
    ...workspaceImports.map((dep) => {
      return [dep, "workspace:*"];
    }),
    ...dependenciesWithInfo.map((dep) => {
      return [dep.dep, `^${dep.version}`];
    }),
  ]);

  const devDependencies = Object.fromEntries(
    dependenciesWithInfo
      .filter((dep) => dep.devDependency)
      .map((dep) => {
        return [dep.devDependency.dep, `^${dep.devDependency.version}`];
      }),
  );

  console.log(
    JSON.stringify(
      {
        dependencies,
        devDependencies,
      },
      null,
      2,
    ),
  );
});
