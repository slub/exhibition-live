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
import { listAll, loadEntity, typeNameToTypeIRI } from "./loader";
import { filterJSONLD } from "./filterJSONLD";

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
    const typeIRI = typeNameToTypeIRI(type);
    const item = await loadEntity(type, entityIRI, typeIRI);
    const result = noJsonld ? filterJSONLD(item) : item;
    if (pretty) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(JSON.stringify(result));
    }
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
    listAll(
      (item) => {
        const result = noJsonld ? filterJSONLD(item) : item;
        if (pretty) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(JSON.stringify(result));
        }
      },
      type,
      amount,
      search,
    );
  },
});

const ownSubcommand = subcommands({
  name: "list",
  cmds: { list, get },
});

run(ownSubcommand, process.argv.slice(2));
