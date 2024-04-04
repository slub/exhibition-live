import { Prefixes } from "@slub/edb-core-types";

export const prefixes2sparqlPrefixDeclaration = (prefixes: Prefixes) =>
  Object.entries(prefixes)
    .map(([k, v]) => `PREFIX ${k}: <${v}>`)
    .join("\n");
