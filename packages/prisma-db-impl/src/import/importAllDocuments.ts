import { AbstractDatastore } from "@slub/edb-global-types";
import { PrismaClient } from "@prisma/client";
import { startBulkImport } from "./startBulkImport";
import { importDocument } from "./importDocument";

/**
 * Import all documents of a given type, will either use the iterable implementation if implemented within the importStore implementation
 * or the listDocuments function as a fallback
 * The iterable implementation will have the effect that a progress bar will be displayed
 * @param typeName What type to import
 * @param importStore The store to import from
 * @param prisma The prisma client to import to
 * @param limit The limit of documents to import
 */
export const importAllDocuments: (
  typeName: string,
  importStore: AbstractDatastore,
  prisma: PrismaClient,
  limit?: number,
) => Promise<any> = (typeName, importStore, prisma, limit = 10000) =>
  importStore.iterableImplementation
    ?.listDocuments(typeName, limit)
    .then(async (result) =>
      startBulkImport(typeName, importStore, prisma, limit, result),
    ) ||
  importStore.listDocuments(typeName, limit, (doc) =>
    importDocument(
      typeName,
      doc,
      importStore,
      prisma,
      new Set(),
      new Set<string>(),
    ),
  );
