---
to: packages/<%= name.split("/")[1] %>/package.json
---
{
  "name": "<%= name %>",
  "version": "1.0.0",
  "description": "<%= description %>",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint \"**/*.ts*\"",
    "lint-fix": "eslint --fix \"**/*.ts*\"",
    "test": "jest",
    "test:watch": "jest --watch --color",
    "test:coverage": "jest --coverage",
    "doc": "typedoc"
  },
  "devDependencies": {
    "@slub/edb-build-helper": "workspace:*",
    "@slub/edb-tsconfig": "workspace:*",
    "@slub/edb-tsup-config": "workspace:*",
    "eslint-config-edb": "workspace:*",
    "@types/jest": "^29",
    "typescript": "^5"
  }
}

