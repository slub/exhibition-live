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
import { File } from "cmd-ts/batteries/fs";

export type FlatImportHandler = (option: {
  file: string;
  mimeType: string | undefined;
  mappingDeclaration: string;
  amount: number | undefined;
  offset: number | undefined;
  dryRun: boolean;
}) => Promise<void>;
export const makeEdbCli = (
  dataStore: AbstractDatastore,
  importStores: AbstractDatastore[],
  flatMappings?: AvailableFlatMappings,
  flatImportHandler?: FlatImportHandler,
) => {
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
      type: positional(File),
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
          type: string,
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
      },
      handler: flatImportHandler,
    });

  return { list, get, flatImport };
};
