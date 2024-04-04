import cliProgress from "cli-progress";
import { PrismaClient } from "@prisma/client";
import { AbstractDatastore, CountAndIterable } from "@slub/edb-global-types";

type PropertiesAndConnects = {
  id?: string;
  properties: Record<string, any>;
  connects: Record<string, { id: string } | { id: string }[]>;
};

const getPropertiesAndConnects = async (
  typeNameOrigin: string,
  document: any,
  prisma: PrismaClient,
  importError: Set<string>,
  prefix: string = "",
  middleware?: (
    typeName: string,
    entityIRI: string,
    document: any,
    importError: Set<string>,
  ) => Promise<boolean>,
): Promise<PropertiesAndConnects> => {
  const { id, ...rest } = Object.fromEntries(
    Object.entries(document)
      .filter(([key, value]) => typeof value !== "object")
      .map(([key, value]) => [`${prefix}${key.replace("@", "")}`, value]),
  );
  let connects: Record<string, { id: string } | { id: string }[]> = {};
  let properties: Record<string, any> = rest;
  const documentObjects = Object.entries(document).filter(
    ([key, value]) => typeof value === "object",
  ) as [string, any];
  for (let [key, value] of documentObjects) {
    if (Array.isArray(value)) {
      const connectsTemp: { id: string }[] = [];
      for (let item of value) {
        if (
          typeof item["@type"] === "string" &&
          typeof item["@id"] === "string"
        ) {
          if (middleware) {
            const success = await middleware(
              typeNameOrigin,
              item["@id"],
              item,
              importError,
            );
            if (success) connectsTemp.push({ id: item["@id"] });
          } else {
            connectsTemp.push({ id: item["@id"] });
          }
        } else {
          //console.log("not implemented")
        }
      }
      if (connectsTemp.length > 0) connects[key] = connectsTemp;
    } else {
      if (
        typeof value["@type"] === "string" &&
        typeof value["@id"] === "string"
      ) {
        if (middleware) {
          const success = await middleware(
            typeNameOrigin,
            value["@id"],
            value,
            importError,
          );
          if (success) connects[key] = { id: value["@id"] };
        } else {
          connects[key] = { id: value["@id"] };
        }
      } else if (!value["@id"] && !value["@type"]) {
        const { properties: subProperties, connects: subConnects } =
          await getPropertiesAndConnects(
            typeNameOrigin,
            value,
            prisma,
            importError,
            `${key}_`,
          );
        properties = {
          ...properties,
          ...subProperties,
        };
        connects = {
          ...connects,
          ...subConnects,
        };
      } else {
        //console.log("not implemented")
      }
    }
  }
  return {
    id: typeof id === "string" ? id : undefined,
    properties,
    connects,
  };
};
const saveData = async (
  typeNameOrigin: string,
  document: any,
  prisma: PrismaClient,
  importError: Set<string>,
) => {
  const { id, properties, connects } = await getPropertiesAndConnects(
    typeNameOrigin,
    document,
    prisma,
    importError,
    "",
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
const importData = async (
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
      typeName: string,
      entityIRI: string,
      document: any,
      importError: Set<string>,
    ) => {
      try {
        await importStore
          .loadDocument(typeName, entityIRI)
          .then(
            (doc) =>
              doc &&
              importData(
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
      importData(
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

const startBulkImport = async (
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
    await importData(typeName, doc, importStore, prisma, visited, errored);
    bar.increment();
  }
  bar.stop();
};
/**
 * Import all documents of a given type, will either use the iterable implementation if implemented within the importStore impementation
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
    importData(
      typeName,
      doc,
      importStore,
      prisma,
      new Set(),
      new Set<string>(),
    ),
  );
