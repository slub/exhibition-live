import { AbstractDatastore, CountAndIterable } from "@slub/edb-global-types";
import { PrismaClient } from "@prisma/client";
import cliProgress from "cli-progress";
import { importDocument } from "./importDocument";

/**
 * Start the bulk import of a given type
 * WIll import all documents of a given type from the importStore to the prisma store
 * optionally limited by the limit parameter
 * @param typeName the type to import
 * @param importStore the store to import from
 * @param prisma the prisma client to import to
 * @param limit how many documents to import
 * @param result
 */
export const startBulkImport = async (
  typeName: string,
  importStore: AbstractDatastore,
  prisma: PrismaClient,
  limit: number,
  result: CountAndIterable<any>,
) => {
  const visited = new Set<string>();
  const errored = new Set<string>();
  const { amount, iterable: docs } = result;
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(amount, 0);
  for await (let doc of docs) {
    await importDocument(typeName, doc, importStore, prisma, visited, errored);
    bar.increment();
  }
  bar.stop();
};
