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
};

const defaultOptions: Partial<WalkerOptions> = {
  omitEmptyArrays: true,
  omitEmptyObjects: true,
  maxRecursionEachRef: 2,
  maxRecursion: 1,
  skipAtLevel: 3,
  doNotRecurseNamedNodes: true,
};

const cleanJSONLD = async (
  data: NamedEntityData,
  schema: JSONSchema7,
  {
    jsonldContext,
    defaultPrefix,
    walkerOptions: walkerOptionsPassed = {},
  }: CleanJSONLDOptions,
) => {
  const entityIRI = data["@id"];
  const walkerOptions = {
    ...defaultOptions,
    ...walkerOptionsPassed,
  };

  //iterate through object and filter out every key, whose value is an empty object or an empty array
  const jsonldDoc = Object.keys(data).reduce(
    (acc, key) => {
      const prop = data[key];
      if (Array.isArray(prop) && prop.length === 0) return acc;
      if (
        typeof prop === "object" &&
        (Object.keys(prop).length === 0 ||
          (Object.keys(prop).length === 1 && prop["@type"]))
      ) {
        return acc;
      }
      return {
        ...acc,
        [key]: data[key],
      };
    },
    jsonldContext
      ? {
          "@context": jsonldContext,
        }
      : {},
  );

  try {
    const jsonldStream = stringToStream(JSON.stringify(jsonldDoc));
    const parser = new Parser();
    const ds = await dsExt.fromStream(
      datasetFactory.dataset(),
      parser.import(jsonldStream),
    );
    return jsonSchemaGraphInfuser(
      defaultPrefix,
      entityIRI,
      ds as Dataset,
      schema,
      walkerOptions,
    );
  } catch (e) {
    throw new Error("Cannot convert JSONLD to dataset", e);
  }
};
