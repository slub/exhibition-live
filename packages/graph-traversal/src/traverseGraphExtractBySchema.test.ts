import {describe, expect, test} from "@jest/globals";
import datasetFactory from "@rdfjs/dataset";
import N3Parser from "@rdfjs/parser-n3";
import {Dataset} from "@rdfjs/types";
import fs from "fs";
import {JSONSchema7} from "json-schema";
import path, {dirname} from "path";
import dsExt from "rdf-dataset-ext";

import {jsonSchemaGraphInfuser} from "./traverseGraphExtractBySchema";
import {fileURLToPath} from "url";

// @ts-ignore
const __dirname = dirname(fileURLToPath(import.meta.url));

function sampleDataset() {
  const filename = path.join(
    __dirname,
    "../../../node_modules/tbbt-ld",
    "dist/tbbt.nq",
  );
  const input = fs.createReadStream(filename);
  const parser = new N3Parser();

  return dsExt.fromStream(datasetFactory.dataset(), parser.import(input));
}

const schemaStub = {
  $defs: {
    Address: {
      type: "object",
      properties: {
        addressCountry: {
          type: "string",
        },
        addressRegion: {
          type: "string",
        },
        postalCode: {
          type: "string",
        },
        streetAddress: {
          type: "string",
        },
      },
    },
    Person: {
      title: "Person",
      description: "A human being",
      type: "object",
      properties: {
        familyName: {
          type: "string",
        },
        givenName: {
          type: "string",
        },
        knows: {
          type: "array",
          items: {
            $ref: "#/$defs/Person",
          },
        },
        address: {
          $ref: "#/$defs/Address",
        },
      },
    },
  },
  $schema: "http://json-schema.org/draft-06/schema#",
  $id: "https://example.com/person.schema.json",
};

describe("can get data via json schema", () => {
  test("build from clownface", () => {
    expect(sampleDataset()).toBeDefined();
  });

  const baseIRI = "http://schema.org/";
  test("get from test schema", async () => {
    const schema = {...schemaStub, ...schemaStub.$defs.Person};
    const ds = await sampleDataset();
    const data = jsonSchemaGraphInfuser(
      baseIRI,
      "http://localhost:8080/data/person/leonard-hofstadter",
      ds as Dataset,
      schema as JSONSchema7,
      {
        omitEmptyArrays: true,
        omitEmptyObjects: true,
        maxRecursionEachRef: 1,
        maxRecursion: 5,
      },
    );
    //console.log(JSON.stringify(data, null, 2))
    expect(data).toStrictEqual({
      "@id": "http://localhost:8080/data/person/leonard-hofstadter",
      "@type": "http://schema.org/Person",
      "address": {
        "addressCountry": "US",
        "addressRegion": "CA",
        "postalCode": "91104",
        "streetAddress": "2311 North Los Robles Avenue, Aparment 4A",
      },
      familyName: "Hofstadter",
      givenName: "Leonard",
      knows: [
        {
          "@id": "http://localhost:8080/data/person/amy-farrah-fowler",
          "@type": "http://schema.org/Person",
          familyName: "Fowler",
          givenName: "Amy",
        },
        {
          "@id": "http://localhost:8080/data/person/bernadette-rostenkowski",
          "@type": "http://schema.org/Person",
          familyName: "Rostenkowski-Wolowitz",
          givenName: "Bernadette",
        },
        {
          "@id": "http://localhost:8080/data/person/howard-wolowitz",
          "@type": "http://schema.org/Person",
          familyName: "Wolowitz",
          givenName: "Howard",
        },
        {
          "@id": "http://localhost:8080/data/person/penny",
          "@type": "http://schema.org/Person",
          "address": {
            "addressCountry": "US",
            "addressRegion": "CA",
            "postalCode": "91104",
            "streetAddress": "2311 North Los Robles Avenue, Aparment 4B",
          },
          givenName: "Penny",
        },
        {
          "@id": "http://localhost:8080/data/person/rajesh-koothrappali",
          "@type": "http://schema.org/Person",
          familyName: "Koothrappali",
          givenName: "Rajesh",
        },
        {
          "@id": "http://localhost:8080/data/person/sheldon-cooper",
          "@type": "http://schema.org/Person",
          "address": {
            "addressCountry": "US",
            "addressRegion": "CA",
            "postalCode": "91104",
            "streetAddress": "2311 North Los Robles Avenue, Aparment 4A",
          },
          familyName: "Cooper",
          givenName: "Sheldon",
        },
        {
          "@id": "http://localhost:8080/data/person/stuart-bloom",
          "@type": "http://schema.org/Person",
          familyName: "Bloom",
          givenName: "Stuart",
        },
        {
          "@id": "http://localhost:8080/data/person/mary-cooper",
          "@type": "http://schema.org/Person",
          "address": {
            "addressCountry": "US",
            "addressRegion": "TX",
          },
          familyName: "Cooper",
          givenName: "Mary",
        },
      ],
    });
  });
});
