import {
  AbstractDatastore,
  AvailableFlatMappings,
} from "@slub/edb-global-types";
import { formatJSONResult } from "@slub/edb-core-utils";
import {
  boolean,
  command,
  flag,
  number,
  oneOf,
  option,
  optional,
  positional,
  string,
} from "cmd-ts";
import { JSONSchema7 } from "json-schema";
import { defs } from "@slub/json-schema-utils";
import { File } from "cmd-ts/batteries/fs";
import { AuthorityConfiguration } from "@slub/edb-data-mapping";

export type FlatImportHandler = (option: {
  file: string;
  mimeType: string | undefined;
  mappingDeclaration: string;
  amount: number | undefined;
  offset: number | undefined;
  dryRun: boolean;
  debug: boolean;
}) => Promise<void>;

export type SemanticSeedHandler = (option: {
  file: string;
  schema: JSONSchema7;
  onDocument: (
    entityIRI: string,
    typeIRI: string,
    document: any,
  ) => Promise<void>;
}) => Promise<void>;
export type MapFromAuthorityHandlerOptions = {
  enableLogging?: string;
};
export type MapFromAuthorityHandler = (
  id: string | undefined,
  classIRI: string,
  entryData: any,
  authorityIRI: string,
  limit: number,
  options?: MapFromAuthorityHandlerOptions,
) => Promise<any>;

export const makeEdbCli = (
  schema: JSONSchema7,
  dataStore: AbstractDatastore,
  importStores: Record<string, AbstractDatastore>,
  flatMappings?: AvailableFlatMappings,
  flatImportHandler?: FlatImportHandler,
  semanticImportHandler?: SemanticSeedHandler,
  mapFromAuthority?: MapFromAuthorityHandler,
  authorityConfigurations?: Record<string, AuthorityConfiguration>,
) => {
  const types = Object.keys(defs(schema));
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
        throw new Error(
          "Loading an entity without type currently not supported",
        );
      }
      const item = await dataStore.loadDocument(type, entityIRI);
      console.log(formatJSONResult(item, pretty, noJsonld));
    },
  });

  const list = command({
    name: "edb-cli list",
    args: {
      type: positional({
        type: oneOf(types),
        displayName: "type",
        description: "The Type of the documents to be listed",
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
    handler: async ({ type, amount = 1, search, pretty, noJsonld }) => {
      await dataStore.findDocuments(type, { search }, amount, (item) => {
        console.log(formatJSONResult(item, pretty, noJsonld));
        return Promise.resolve();
      });
      process.exit(0);
    },
  });

  const flatImport =
    flatMappings &&
    flatImportHandler &&
    command({
      name: "edb-cli flat-import",
      description: "Import of flat table structured documents",
      args: {
        file: positional({
          type: File,
          displayName: "File Path",
          description: "The path to the file to import",
        }),
        mappingDeclaration: option({
          type: oneOf(Object.keys(flatMappings)),
          description: `The flat mapping to use for the import (can available: ${Object.keys(
            flatMappings,
          )
            .map((k) => `"${k}"`)
            .join(",")} )`,
          long: "mapping",
          short: "m",
        }),
        mimeType: option({
          type: optional(oneOf(["application/csv", "application/json"])),
          description: "The MIME type of the document to import",
          defaultValue: () => "application/csv",
          defaultValueIsSerializable: true,
          long: "mime-type",
          short: "mime",
        }),
        amount: option({
          type: optional(number),
          description: "The amount of rows to import",
          long: "amount",
          short: "n",
        }),
        offset: option({
          type: optional(number),
          description: "The offset to start importing from",
          long: "offset",
          short: "o",
        }),
        dryRun: flag({
          type: boolean,
          description: "Do not import the data, just show the mapped data",
          long: "dry-run",
          short: "d",
        }),
        debug: flag({
          type: boolean,
          description: "Enable debug logging",
          long: "debug",
        }),
      },
      handler: flatImportHandler,
    });

  const importFromAuthority =
    authorityConfigurations &&
    mapFromAuthority &&
    command({
      name: "import-from-authority",
      description: "Import data from an authority source",
      args: {
        id: positional({
          type: string,
          description: "The ID of the entity in the authority source",
        }),
        type: option({
          type: string,
          description: "The Type of the document, that should be imported",
          long: "type",
          short: "t",
        }),
        authorityIRI: option({
          type: string,
          description: "The IRI of the authority source",
          long: "authority-iri",
          short: "au",
        }),
        limit: option({
          type: optional(number),
          description: "The maximum number of results to return",
          long: "limit",
          defaultValue: () => 1,
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
        debug: flag({
          type: boolean,
          description: "Enable debug logging",
          long: "debug",
        }),
      },
      handler: async ({
        id,
        type,
        authorityIRI,
        limit,
        pretty,
        noJsonld,
        debug,
      }) => {
        try {
          const authConfig = authorityConfigurations[authorityIRI];
          if (!authConfig)
            throw new Error(
              `no authority configuration found for ${authorityIRI}`,
            );
          const entryData = await authConfig.getEntityByIRI(id);
          if (!entryData) throw new Error(`no entry data found for ${id}`);
          const result = await mapFromAuthority(
            id,
            dataStore.typeNameToTypeIRI(type),
            {
              allProps: entryData,
            },
            authorityIRI,
            limit || 1,
            debug ? { enableLogging: "debug" } : undefined,
          );
          console.log(formatJSONResult(result, pretty, noJsonld));
        } catch (error) {
          console.error("Error importing from authority:", error);
          process.exit(1);
        }
        process.exit(0);
      },
    });

  const importCommand = command({
    name: "import",
    description: "Recursively import data from another data store",
    args: {
      typeName: positional({
        type: oneOf(types),
        displayName: "type",
        description: "The Type of the document",
      }),
      importStoreName: option({
        type: oneOf(Object.keys(importStores)),
        long: "importFrom",
        short: "i",
        description: `the store where data should be imported (${Object.keys(importStores).join(" , ")})`,
      }),
      entityIRI: option({
        type: optional(string),
        long: "entityIRI",
        short: "e",
        description: "only import a single entity identified by the entityIRI",
      }),
      limit: option({
        type: optional(number),
        description: "The number of documents to import",
        defaultValue: () => 10000,
        long: "limit",
        short: "l",
      }),
    },
    handler: async ({ entityIRI, typeName, importStoreName, limit }) => {
      const importStore = importStores[importStoreName];
      if (!importStore) {
        throw new Error(`import store ${importStoreName} not found in config`);
        process.exit(1);
      }
      if (entityIRI) {
        await dataStore.importDocument(typeName, entityIRI, importStore);
      } else {
        await dataStore.importDocuments(typeName, importStore, limit || 10);
      }
      process.exit(0);
    },
  });

  const seed = command({
    name: "seed",
    description: "Seed the database with data from a file",
    args: {
      file: positional({
        type: File,
        displayName: "File Path",
        description:
          "The path to the file to import (Turtle, N-Triples, JSON-LD)",
      }),
      dryRun: flag({
        type: optional(boolean),
        description: "Do not import the data, just show the mapped data",
        long: "dry-run",
        short: "d",
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

    handler: async ({ file, dryRun, pretty, noJsonld }) => {
      if (!semanticImportHandler) {
        throw new Error("Semantic import not supported");
      }
      await semanticImportHandler({
        file,
        schema,
        onDocument: async (entityIRI, typeIRI, document) => {
          const result = !dryRun
            ? await dataStore.upsertDocument(
                dataStore.typeIRItoTypeName(typeIRI),
                entityIRI,
                document,
              )
            : document;
          console.log(formatJSONResult(result, pretty, noJsonld));
        },
      });
      process.exit(0);
    },
  });

  return {
    list,
    get,
    flatImport,
    import: importCommand,
    importFromAuthority,
    seed,
  };
};
