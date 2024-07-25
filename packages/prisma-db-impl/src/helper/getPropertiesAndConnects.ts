import { PrismaClient } from "@prisma/client";
import { PropertiesAndConnects } from "../types";

export const getPropertiesAndConnects = async (
  typeNameOrigin: string,
  document: any,
  prisma: PrismaClient,
  importError: Set<string>,
  prefix: string = "",
  middleware?: (
    typeIRI: string | undefined,
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
        if (typeof item["@id"] === "string") {
          if (middleware) {
            const success = await middleware(
              item["@type"],
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
            value["@type"],
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
            middleware,
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
