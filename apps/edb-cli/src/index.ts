import {
  boolean,
  command,
  flag,
  number,
  option,
  optional,
  positional,
  run,
  string,
  subcommands,
} from "cmd-ts";
import { filterJSONLD } from "./filterJSONLD";
import { dataStore } from "./dataStore";

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
      type: optional(string),
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
      type: string,
      displayName: "Type Name",
      description: "The Type of the document",
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

const ownSubcommand = subcommands({
  name: "list",
  cmds: { list, get },
});

run(ownSubcommand, process.argv.slice(2));
