import stringToStream from "string-to-stream";
import Parser from "@rdfjs/parser-jsonld";
import dsExt from "rdf-dataset-ext";
import datasetFactory from "@rdfjs/dataset";
import {
  jsonSchemaGraphInfuser,
  WalkerOptions,
} from "../graph/jsonSchemaGraphInfuser";
import { Dataset } from "@rdfjs/types";
import { JsonLdContext } from "jsonld-context-parser";
import { JSONSchema7 } from "json-schema";
import { NamedEntityData } from "./types";

type CleanJSONLDOptions = {
  walkerOptions?: Partial<WalkerOptions>;
  jsonldContext?: JsonLdContext;
  defaultPrefix: string;
  keepContext?: boolean;
};

const defaultOptions: Partial<WalkerOptions> = {
  omitEmptyArrays: true,
  omitEmptyObjects: true,
  maxRecursionEachRef: 2,
  maxRecursion: 3,
  skipAtLevel: 3,
  doNotRecurseNamedNodes: true,
};

const cleanProperty = (data: any) => {
  return Array.isArray(data)
    ? data.map(cleanProperty)
    : typeof data === "object"
    ? Object.keys(data).reduce((acc, key) => {
        const prop = data[key];
        if (typeof prop === "object") {
          const cleanedProp = cleanProperty(prop);
          if (Array.isArray(cleanedProp) && prop.length === 0) return acc;
          if (
            !Array.isArray(cleanedProp) &&
            (Object.keys(cleanedProp).length === 0 ||
              (Object.keys(cleanedProp).length === 1 && cleanedProp["@type"]))
          ) {
            return acc;
          }
          return {
            ...acc,
            [key]: cleanedProp,
          };
        }
        return {
          ...acc,
          [key]: prop,
        };
      }, {})
    : data;
};

const collect = (schema: JSONSchema7, container: "@list" | "@set" = "@set") => {
  if (schema.type === "array" && !Array.isArray(schema.items)) {
    if ((schema.items as JSONSchema7)?.type) {
      const itemsType = (schema.items as JSONSchema7)?.type;
      if (!Array.isArray(itemsType)) {
        switch (itemsType) {
          case "object":
            return undefined;
          case "array":
            return undefined;
          case "integer":
            return {
              "@container": container,
              "@type": "xs:integer",
            };
          case "number":
            return {
              "@container": container,
              "@type": "xs:double",
            };
          case "boolean":
            return {
              "@container": container,
              "@type": "xs:boolean",
            };
          case "string":
          default:
            return {
              "@container": container,
              "@type": "xs:string",
            };
        }
      }
    }
  }
};
const collectPrimitiveArrayFields = (schema: JSONSchema7) => {
  return Object.fromEntries(
    Object.entries(schema.properties)
      .map(([key, subSchema]) => {
        if ((subSchema as JSONSchema7)?.type === "array") {
          return [key, collect(subSchema as JSONSchema7)];
        } else {
          return [key, undefined];
        }
      })
      .filter(([_, value]) => value !== undefined),
  );
};

export const cleanJSONLD = async (
  data: NamedEntityData,
  schema: JSONSchema7,
  {
    jsonldContext,
    defaultPrefix,
    walkerOptions: walkerOptionsPassed = {},
    keepContext,
  }: CleanJSONLDOptions,
) => {
  const entityIRI = data["@id"];
  const walkerOptions = {
    ...defaultOptions,
    ...walkerOptionsPassed,
  };

  const finalJsonldContext =
    typeof jsonldContext === "object"
      ? {
          ...jsonldContext,
        }
      : {};

  const jsonldDoc = {
    ...cleanProperty(data),
    ...(finalJsonldContext ? { "@context": finalJsonldContext } : {}),
  };

  try {
    const jsonldStream = stringToStream(JSON.stringify(jsonldDoc));
    const parser = new Parser();
    const ds = await dsExt.fromStream(
      datasetFactory.dataset(),
      parser.import(jsonldStream),
    );
    const res = jsonSchemaGraphInfuser(
      defaultPrefix,
      entityIRI,
      ds as Dataset,
      schema,
      walkerOptions,
    );
    return keepContext && finalJsonldContext
      ? { ...res, "@context": finalJsonldContext }
      : res;
  } catch (e) {
    throw new Error("Cannot convert JSONLD to dataset", e);
  }
};
