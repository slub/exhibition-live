import { describe, expect, test } from "@jest/globals";
import { JSONSchema7 } from "json-schema";
import { jsonSchema2Select } from "./jsonSchema2Select";

const schema: JSONSchema7 = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://example.com/person.schema.json",
  title: "Person",
  description: "A human being",
  type: "object",
  required: ["name", "father"],
  properties: {
    name: {
      type: "string",
    },
    knows: {
      type: "array",
      items: {
        required: ["nick"],
        properties: {
          nick: { type: "string" },
        },
      },
    },
    father: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
      },
    },
  },
};

const schema2: JSONSchema7 = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://example.com/person.schema.json",
  title: "Person",
  description: "A human being",
  type: "object",
  required: ["name", "father"],
  properties: {
    name: {
      type: "string",
    },
    knows: {
      type: "array",
      items: {
        required: ["nick"],
        properties: {
          nick: { type: "string" },
        },
      },
    },
    father: {
      type: "object",
      properties: {
        "@id": { type: "string" },
        name: { type: "string" },
        description: { type: "string" },
      },
    },
  },
};

describe("make select query", () => {
  test("should make a select query", () => {
    const query = jsonSchema2Select(schema, "http://example.com/person");
    //trim whitespace on each line
    const strippedQuery = query.replace(/^\s+|\s+$/gm, "");
    expect(strippedQuery).toEqual(
      "SELECT DISTINCT ?entity  (SAMPLE(?name) AS ?name_single)  (COUNT(DISTINCT ?knows) AS ?knows_count)  (SAMPLE(?father_name) AS ?father_name_single)  (SAMPLE(?father_description) AS ?father_description_single)  WHERE {\n?entity a <http://example.com/person> .\n?entity :name ?name .  OPTIONAL {  ?entity :knows ?knows .\n}  ?entity :father ?father .\nOPTIONAL {  ?father :name ?father_name .  }  OPTIONAL {  ?father :description ?father_description .  }\n}\nGROUP BY ?entity",
    );
  });
});
