import { primaryFields, schema } from "@slub/exhibition-schema";
import {
  boolean,
  command,
  flag,
  number,
  oneOf,
  option,
  optional,
  positional,
  run,
  string,
  subcommands,
} from "cmd-ts";
import { prismaStore } from "./prismaStore";
import { defs } from "@slub/json-schema-utils";
import { JSONSchema7 } from "json-schema";
import { dataStore as sparqlStore } from "./dataStore";
import { extendSchema } from "./extendSchema";
import { PrismaClient } from "@prisma/edb-exhibition-client";
import { filterJSONLD } from "@slub/edb-core-utils";

const importStore = sparqlStore;
const prisma = new PrismaClient();

const rootSchema = extendSchema(schema as JSONSchema7);
const dataStore = prismaStore(prisma, rootSchema, primaryFields);
//bun only runs if we call it here: why??
//find first object that can be counted:
for (const key of Object.keys(prisma)) {
  if (prisma[key]?.count) {
    const c = await prisma[key].count();
    //console.log(c)
    break;
  }
}

const allTypes = Object.keys(defs(schema as JSONSchema7));
const importCommand = command({
  name: "import",
  args: {
    typeName: positional({
      type: oneOf(allTypes),
      displayName: "typeName",
      description: "The Type of the document",
    }),
    entityIRI: option({
      type: optional(string),
      long: "entityIRI",
      short: "e",
    }),
    limit: option({
      type: optional(number),
      description: "The number of documents to import",
      defaultValue: () => 10000,
      long: "limit",
      short: "l",
    }),
  },
  handler: async ({ entityIRI, typeName, limit }) => {
    if (entityIRI) {
      await dataStore.importDocument(typeName, entityIRI, importStore);
    } else {
      await dataStore.importDocuments(typeName, importStore, limit || 10);
    }
    process.exit(0);
  },
});

const formatResult = (result: any, pretty?: boolean, noJsonLD?: boolean) => {
  const res = noJsonLD ? filterJSONLD(result) : result;
  return pretty ? JSON.stringify(res, null, 2) : JSON.stringify(res);
};
const get = command({
  name: "edb-cli get",
  args: {
    entityIRI: positional({
      type: string,
      displayName: "entityIRI",
      description: "the IRI of the entity to fetch",
    }),
    type: option({
      type: optional(oneOf(allTypes)),
      description: "The Type of the document",
      long: "type",
      short: "t",
    }),
    pretty: flag({
      type: boolean,
      description: "Pretty print the output",
      long: "pretty",
      short: "p",
    }),
    noJsonld: flag({
      type: boolean,
      description: "Filter JSON-LD properties",
      long: "no-jsonld",
    }),
  },
  handler: async ({ entityIRI, type, pretty, noJsonld }) => {
    if (!type) {
      throw new Error("Loading an entity without type currently not supported");
    }
    const item = await dataStore.loadDocument(type, entityIRI);
    console.log(formatResult(item, pretty, noJsonld));
    process.exit(0);
  },
});

const list = command({
  name: "edb-cli list",
  args: {
    type: positional({
      type: oneOf(allTypes),
      displayName: "Type Name",
      description: `The Type of the document (e.g Person)`,
    }),
    amount: option({
      type: optional(number),
      description: "The amount of documents to fetch",
      long: "amount",
      short: "n",
    }),
    search: option({
      type: optional(string),
      description: "The search string",
      long: "search",
      short: "s",
    }),
    pretty: flag({
      type: boolean,
      description: "Pretty print the output",
      long: "pretty",
      short: "p",
    }),
    noJsonld: flag({
      type: boolean,
      description: "Filter JSON-LD properties",
      long: "no-jsonld",
    }),
    flat: flag({
      type: boolean,
      description:
        "get the results as flat SPARQL Select like answer result set",
      long: "flat",
    }),
  },
  handler: async ({ type, amount = 1, flat, search, pretty, noJsonld }) => {
    if (flat) {
      if (!dataStore.findDocumentsAsFlatResultSet) {
        console.error("not implemented");
        process.exit(-1);
      }
      const results = await dataStore.findDocumentsAsFlatResultSet(
        type,
        { search },
        amount,
      );
      console.log(formatResult(results, pretty, false));
    } else {
      await dataStore.findDocuments(type, { search }, amount, (item) => {
        console.log(formatResult(item, pretty, noJsonld));
        return Promise.resolve();
      });
    }
    process.exit(0);
  },
});

const allCommands = subcommands({
  name: "edb-cli",
  cmds: { list, get, import: importCommand },
});

run(allCommands, process.argv.slice(2));
