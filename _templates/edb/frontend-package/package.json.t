---
to: packages/<%= name.split("/")[1] %>/package.json
---
{
  "name": "<%= name %>",
  "version": "1.0.0",
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
    "build": "tsup src/index.tsx",
    "dev": "tsup src/index.tsx",
    "lint": "eslint \"**/*.ts*\"",
    "lint-fix": "eslint --fix \"**/*.ts*\""
  },
  "peerDependencies": {
    "@mui/material": "^5",
    "@mui/icons-material": "^5",
    "react": "^18"
  },
  "dependencies": {
  },
  "devDependencies": {
    "@slub/edb-build-helper": "workspace:*",
    "@slub/edb-tsconfig": "workspace:*",
    "@slub/edb-tsup-config": "workspace:*"
  }
}

