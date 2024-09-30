import { AbstractDatastore } from "@slub/edb-global-types";
import type { PrismaClient } from "@prisma/client";
import { getPropertiesAndConnects } from "../helper";

/**
 * Import a document into the prisma store and connect it to other documents
 * will recursively import connected documents from the importStore
 *
 * @param typeNameOrigin
 * @param document
 * @param importStore
 * @param prisma
 * @param visited
 * @param importError
 */
export const importDocument = async (
  typeNameOrigin: string,
  document: any,
  importStore: AbstractDatastore,
  prisma: PrismaClient,
  visited: Set<any>,
  importError: Set<string>,
) => {
  if (visited.has(document["@id"]) || importError.has(document["@id"])) {
    return;
  }
  visited.add(document["@id"]);
  const { id, properties, connects } = await getPropertiesAndConnects(
    typeNameOrigin,
    document,
    prisma,
    importError,
    "",
    async (
      typeIRI: string | undefined,
      entityIRI: string,
      document: any,
      importError: Set<string>,
    ) => {
      let typeName = "";
      if (typeIRI) {
        typeName = importStore.typeIRItoTypeName(typeIRI);
      } else {
        if (!importStore.getClasses) {
          throw new Error(
            "not typeIRI provided and import store does not implement the getClasses method.",
          );
        } else {
          const classIRI = (await importStore.getClasses(entityIRI))[0];
          if (!classIRI) {
            throw new Error("no classIRI found for entityIRI");
          }
          typeName = importStore.typeIRItoTypeName(classIRI);
        }
      }
      try {
        await importStore
          .loadDocument(typeName, entityIRI)
          .then(
            (doc) =>
              doc &&
              importDocument(
                typeName,
                doc,
                importStore,
                prisma,
                visited,
                importError,
              ),
          );
        return true;
      } catch (error) {
        importError.add(entityIRI);
        console.error(error);
        console.log("could not load document", typeName, entityIRI);
      }
      return false;
    },
  );
  if (!id) {
    console.error("no id");
    return;
  }
  try {
    const upsertResult = await prisma[typeNameOrigin].upsert({
      where: {
        id,
      },
      create: {
        id,
        ...properties,
      },
      update: {
        ...properties,
      },
    });
    const connectKeys = Object.keys(connects);
    if (connectKeys.length === 0) return;
    const connectResult = await prisma[typeNameOrigin].update({
      where: {
        id,
      },
      data: Object.fromEntries(
        Object.entries(connects).map(([key, connect]) => [
          key,
          {
            connect,
          },
        ]),
      ),
      include: Object.fromEntries(connectKeys.map((key) => [key, true])),
    });
    return {
      upsertResult,
      connectResult,
    };
  } catch (error) {
    console.log("could not import document", typeNameOrigin, id);
    console.log(JSON.stringify(connects, null, 2));
    console.error(error);
  }
  return null;
};
export const importSingleDocument = (
  typeName: string,
  entityIRI: string,
  importStore: AbstractDatastore,
  prisma: PrismaClient,
) =>
  importStore
    .loadDocument(typeName, entityIRI)
    .then((doc) =>
      importDocument(
        typeName,
        doc,
        importStore,
        prisma,
        new Set(),
        new Set<string>(),
      ),
    )
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      await prisma.$disconnect();
      console.error(e);
    });
