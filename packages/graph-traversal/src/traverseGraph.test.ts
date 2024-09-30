import { JSONSchema7 } from "json-schema";
import type { DatasetCore, Quad } from "@rdfjs/types";
import datasetFactory from "@rdfjs/dataset";
import { traverseGraphExtractBySchema } from "./traverseGraphExtractBySchema";
import { WalkerOptions } from "./types";
import clownface from "clownface";
import { rdf, schema } from "@tpluscode/rdf-ns-builders";
import namespace from "@rdfjs/namespace";

describe("traverseGraphExtractBySchema", () => {
  const baseIRI = "http://schema.org/";

  const createMockDataset = (): DatasetCore => {
    const dataset = datasetFactory.dataset();
    const cf = clownface({ dataset });

    const person = cf.namedNode("http://example.com/person/john-doe");
    person
      .addOut(rdf.type, schema.Person)
      .addOut(schema.name, "John Doe")
      .addOut(namespace(baseIRI)("age"), 30)
      .addOut(schema.email, "john@example.com");

    const friend = cf.namedNode("http://example.com/person/jane-doe");
    friend.addOut(rdf.type, schema.Person).addOut(schema.name, "Jane Doe");

    person.addOut(schema.knows, friend);

    return dataset;
  };

  const personSchema: JSONSchema7 = {
    type: "object",
    properties: {
      name: { type: "string" },
      age: { type: "number" },
      email: { type: "string" },
      knows: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
        },
      },
    },
  };

  test("extracts data according to schema", () => {
    const dataset = createMockDataset();
    const options: Partial<WalkerOptions> = {
      maxRecursion: 2,
      omitEmptyArrays: true,
      omitEmptyObjects: true,
    };

    const result = traverseGraphExtractBySchema(
      baseIRI,
      "http://example.com/person/john-doe",
      dataset,
      personSchema,
      options,
    );

    expect(result).toEqual({
      "@id": "http://example.com/person/john-doe",
      "@type": "http://schema.org/Person",
      name: "John Doe",
      age: 30,
      email: "john@example.com",
      knows: [
        {
          "@id": "http://example.com/person/jane-doe",
          "@type": "http://schema.org/Person",
          name: "Jane Doe",
        },
      ],
    });
  });

  test("respects maxRecursion option", () => {
    const dataset = createMockDataset();
    const options: Partial<WalkerOptions> = {
      maxRecursion: 1,
      omitEmptyArrays: true,
      omitEmptyObjects: true,
    };

    const result = traverseGraphExtractBySchema(
      baseIRI,
      "http://example.com/person/john-doe",
      dataset,
      personSchema,
      options,
    );

    expect(result).toEqual({
      "@id": "http://example.com/person/john-doe",
      "@type": "http://schema.org/Person",
      name: "John Doe",
      age: 30,
      email: "john@example.com",
      knows: [
        {
          "@id": "http://example.com/person/jane-doe",
          "@type": "http://schema.org/Person",
          name: "Jane Doe",
        },
      ],
    });
  });
});
