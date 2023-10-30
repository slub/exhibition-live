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
    console.log(strippedQuery);
    expect(strippedQuery).toEqual(
      `SELECT ?entity  (SAMPLE(?name_0) AS ?name_0_single)  (COUNT(?knows_0) AS ?knows_0_count)  (SAMPLE(?name_1) AS ?name_1_single)  (SAMPLE(?description_1) AS ?description_1_single)  WHERE {
?entity a <http://example.com/person> .
?entity :name ?name_0 .  OPTIONAL {  ?entity :knows ?knows_0 .  }  ?entity :father ?father_0 .
OPTIONAL {  ?father_0 :name ?name_1 .  }  OPTIONAL {  ?father_0 :description ?description_1 .  }
}
GROUP BY ?entity`,
    );
  });
});
