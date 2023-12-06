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
    : typeof data === 'object'
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
        }
        , {})
      : data;
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

  const jsonldDoc = {
    ...cleanProperty(data),
    ...(jsonldContext ? { "@context": jsonldContext } : {}),
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
    return keepContext && jsonldContext
      ? { ...res, "@context": jsonldContext }
      : res;
  } catch (e) {
    throw new Error("Cannot convert JSONLD to dataset", e);
  }
};
