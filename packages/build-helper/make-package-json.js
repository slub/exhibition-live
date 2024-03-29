const fs = require("fs");
const path = require("path");

//get path of current directory
const currentDirectory = process.cwd();
console.log("currentDirectory", currentDirectory);
// Load the original package.json
const originalPackageJson = require(`${currentDirectory}/package.json`);

// Define the fields to keep for the distribution package.json
const fieldsToKeep = [
  "name",
  "description",
  "keywords",
  "author",
  "license",
  "repository",
  "bugs",
  "homepage",
  "version",
  "main",
  "module",
  "exports",
  "types",
  "dependencies",
  "peerDependencies",
  "engines",
];

// Construct the distribution package.json object
let distPackageJson = {};
fieldsToKeep.forEach((field) => {
  if (originalPackageJson[field]) {
    distPackageJson[field] = originalPackageJson[field];
  }
});
const name = distPackageJson.name;

distPackageJson = {
  ...distPackageJson,
  name: name.replace("_src", ""),
  type: "module", // Enable ESM
  main: "./index.cjs",
  module: "./index.js",
  types: "./index.d.ts", // Fallback TypeScript declaration file
  exports: {
    ".": {
      import: "./index.js",
      require: "./index.cjs",
      default: "./index.js",
      types: "./index.d.ts", // TypeScript declaration for ESM
    },
  },
};

// Path to the distribution directory
const distPath = path.join(currentDirectory, "dist");

// Ensure the distribution directory exists
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
}

// Write the distribution package.json
fs.writeFileSync(
  path.join(distPath, "package.json"),
  JSON.stringify(distPackageJson, null, 2),
);

console.log("Distribution package.json has been generated.");
