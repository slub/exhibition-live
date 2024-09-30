---
to: manifestation/<%= name %>/package.json
---
{
  "name": "@slub/<%= h.changeCase.paramCase(name) %>-schema",
  "version": "1.0.0",
  "description": "Schema for the <%= name %> database",
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
    "schema:export": "bun ./schemas/exportSchema.ts > ./schemas/jsonschema/<%= h.changeCase.pascalCase(name) %>.schema.json",
    "build:prisma": "bun ./src/createPrismaSchemal.ts > ../../prisma/<%= h.changeCase.paramCase(name) %>.prisma",
    "build:doc": "mkdir -p docs/reference && jsonschema2md -o docs/reference -d schemas/jsonschema",
    "build:typebox": "mkdir -p typebox && schema2typebox --input schemas/jsonschema/<%= h.changeCase.pascalCase(name) %>.schema.json --output typebox/generated-typebox.ts"
  },
  "devDependencies": {
    "@types/rdfjs__namespace": "^2.0.8",
    "@slub/json-schema-prisma-utils": "workspace:*",
    "@slub/edb-build-helper": "workspace:*",
    "@slub/edb-data-mapping": "workspace:*",
    "@slub/edb-core-types": "workspace:*",
    "json-schema": "^0.4.0",
    "@adobe/jsonschema2md": "^7.1.5",
    "schema2typebox": "^1.7.5"
  },
  "dependencies": {
    "@rdfjs/namespace": "^2.0.0"
  }
}
