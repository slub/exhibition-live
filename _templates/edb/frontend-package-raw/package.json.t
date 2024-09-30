---
to: packages/<%= name.split("/")[1] %>/package.json
---
{
  "name": "<%= name %>",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.tsx",
  "types": "src/index.tsx",
  "sideEffects": false,
  "scripts": {
    "typecheck": "tsc -b",
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
    "@slub/edb-tsconfig": "workspace:*"
  }
}

