---
to: packages/<%= name.split("/")[1] %>/typedoc.js
---
{
  "extends": ["@slub/edb-tsconfig/typedoc.base.json"],
  "entryPoints": ["src/index.ts"]
}
