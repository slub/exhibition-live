import { dataStore as sparqlStore, typeIRItoTypeName } from "./dataStore";
import cliProgress from "cli-progress";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const importStore = sparqlStore;

type PropertiesAndConnects = {
  id?: string;
  properties: Record<string, any>;
  connects: Record<string, { id: string } | { id: string }[]>;
};
const getPropertiesAndConnects = async (
  typeNameOrigin: string,
  document: any,
  visited: Set<any>,
  importError: Set<string>,
  prefix: string = "",
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
          try {
            const typeName = typeIRItoTypeName(item["@type"]);
            await importStore
              .loadDocument(typeName, item["@id"])
              .then(
                (doc) => doc && importData(typeName, doc, visited, importError),
              );
            connectsTemp.push({ id: item["@id"] });
          } catch (error) {
            importError.add(value["@id"]);
            console.error(error);
            console.log(
              "could not load document",
              value["@type"],
              value["@id"],
            );
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
        try {
          const typeName = typeIRItoTypeName(value["@type"]);
          await importStore
            .loadDocument(typeName, value["@id"])
            .then(
              (doc) => doc && importData(typeName, doc, visited, importError),
            );
          connects[key] = { id: value["@id"] };
        } catch (error) {
          importError.add(value["@id"]);
          console.error(error);
          console.log("could not load document", value["@type"], value["@id"]);
        }
      } else if (!value["@id"] && !value["@type"]) {
        const { properties: subProperties, connects: subConnects } =
          await getPropertiesAndConnects(
            typeNameOrigin,
            value,
            visited,
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
const importData = async (
  typeNameOrigin: string,
  document: any,
  visited: Set<any>,
  importError: Set<string>,
  prefix: string = "",
) => {
  if (visited.has(document["@id"]) || importError.has(document["@id"])) {
    return;
  }
  visited.add(document["@id"]);
  const { id, properties, connects } = await getPropertiesAndConnects(
    typeNameOrigin,
    document,
    visited,
    importError,
    prefix,
  );
  if (!id) {
    console.log("no id");
    return;
  }
  try {
    const importedItem = await prisma[typeNameOrigin].upsert({
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
    const result = await prisma[typeNameOrigin].update({
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
  } catch (error) {
    console.log("could not import document", typeNameOrigin, id);
    console.log(JSON.stringify(connects, null, 2));
    console.error(error);
  }
};
export const importSingleDocument = (typeName: string, entityIRI: string) =>
  importStore
    .loadDocument(typeName, entityIRI)
    .then((doc) => importData(typeName, doc, new Set(), new Set<string>()))
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      await prisma.$disconnect();
      console.error(e);
    });
export const importAllDocuments = (typeName: string, limit = 10000) =>
  importStore?.iterableImplementation
    ?.listDocuments(typeName, limit)
    .then(async (result) => {
      const visited = new Set<string>();
      const errored = new Set<string>();
      const { amount, iterable: docs } = result;
      const bar = new cliProgress.SingleBar(
        {},
        cliProgress.Presets.shades_classic,
      );
      bar.start(amount, 0);
      for await (let doc of docs) {
        await importData(typeName, doc, visited, errored);
        bar.increment();
      }
      bar.stop();
    });
