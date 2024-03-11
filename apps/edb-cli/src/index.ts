import schema from "./Exhibition.schema.json";
import {bringDefinitionToTop} from "@slub/json-schema-utils";
import {JSONSchema7} from "json-schema";
import {oxigraphCrudOptions} from "@slub/remote-query-implementations";
import {load} from "@slub/sparql-schema";
import {findEntityByClass} from "./findEntityByClass";
import {boolean, command, flag, number, option, optional, positional, run, string, subcommands} from "cmd-ts";
import config from "./config";
import {QueryOptions} from "./types.js";

const {
  BASE_IRI,
  namespace: sladb,
  walkerOptions: defaultWalkerOptions,
  defaultPrefix,
  defaultJsonldContext,
  defaultQueryBuilderOptions,
  sparqlEndpoint
} = config;

const queryOptions: QueryOptions = {
  defaultPrefix,
  queryBuildOptions: defaultQueryBuilderOptions,
}

// @ts-ignore
const crudOptions = oxigraphCrudOptions(sparqlEndpoint)
const {constructFetch, updateFetch, selectFetch} = crudOptions;

const loadEntity = async (typeName: string, entityIRI: string, typeIRI: string) => {
  if (!constructFetch) return null;
  const mySchema = bringDefinitionToTop(schema as JSONSchema7, typeName) as JSONSchema7
  const res = await load(entityIRI, typeIRI, mySchema, constructFetch, {
    defaultPrefix: BASE_IRI,
    queryBuildOptions: defaultQueryBuilderOptions,
    walkerOptions: defaultWalkerOptions,
  });
  return res.document;
}

const listAll = async (typeName: string, amount: number, search?: string) => {
  const typeIRI = sladb(typeName).value
  const items = await findEntityByClass(search || null, typeIRI, selectFetch, amount)
  return  await Promise.all(items.map(({value}: {value: string}) => {
    return loadEntity(typeName, value, typeIRI  )
  }))
}

const get = command({
  name: "edb-cli get",
  args: {
    entityIRI: positional({type: string, displayName: "entityIRI" ,description: "the IRI of the entity to fetch"}),
    type: option({type: optional(string),  description: "The Type of the document", long: "type", short: "t"}),
    pretty: flag({type: boolean, description: "Pretty print the output", long: "pretty", short: "p"})
  },
  handler: async ({entityIRI, type, pretty}) => {
    const typeIRI = type ? sladb(type).value : null
    const result = await loadEntity(type || "Thing", entityIRI, typeIRI || sladb("Thing").value)
    if(pretty) {
      console.log(JSON.stringify(result, null, 2))
    } else {
      console.log(JSON.stringify(result))
    }
  }
})


const list = command({
  name: 'edb-cli list',
  args: {
    type: positional({ type: string, displayName: 'Type Name', description: 'The Type of the document' }),
    amount: option({ type: optional(number), description: 'The amount of documents to fetch', long: "amount", short: "n" }),
    search: option({ type: optional(string), description: 'The search string', long: "search", short: "s" }),
    pretty: flag({ type: boolean, description: 'Pretty print the output', long: "pretty", short: "p" }),
  },
  handler: ({ type, amount = 1, search, pretty  }) => {
    listAll(type, amount , search).then((result: any[]) => {
      for(const item of result) {
        if(pretty) {
          console.log(JSON.stringify(item, null, 2))
        } else {
          console.log(JSON.stringify(item))
        }
      }
    })
  },
});

const ownSubcommand = subcommands({
  name: 'list',
  cmds: { list, get },
});


run(ownSubcommand, process.argv.slice(2));
