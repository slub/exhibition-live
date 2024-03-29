import { Prefixes } from "adb-next/components/utils/types";

export const prefixes2sparqlPrefixDeclaration = (prefixes: Prefixes) =>
  Object.entries(prefixes)
    .map(([k, v]) => `PREFIX ${k}: <${v}>`)
    .join("\n");
