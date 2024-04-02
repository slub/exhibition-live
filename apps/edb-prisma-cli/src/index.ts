import schema from "@slub/exhibition-schema/schemas/jsonschema/Exhibition.schema.json";
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
import { filterJSONLD } from "./filterJSONLD";
import { defs } from "@slub/json-schema-utils";
import { JSONSchema7 } from "json-schema";
import { importAllDocuments, importSingleDocument } from "./import";

const dataStore = prismaStore;

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
      importSingleDocument(typeName, entityIRI);
    } else {
      importAllDocuments(typeName, limit);
    }
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
  },
  handler: ({ type, amount = 1, search, pretty, noJsonld }) => {
    dataStore.findDocuments(type, { search }, amount, (item) => {
      console.log(formatResult(item, pretty, noJsonld));
      return Promise.resolve();
    });
  },
});

const allCommands = subcommands({
  name: "edb-cli",
  cmds: { list, get, import: importCommand },
});

run(allCommands, process.argv.slice(2));
