import { JSONSchema7 } from "json-schema";
import { bringDefinitionToTop } from "./jsonSchema";
import { getSubschemaByPath } from "./getSubschemaByPath";

const rootSchema = {
  $id: "https://example.com/schemas/person",
  definitions: {
    address: {
      type: "object",
      properties: {
        street: { type: "string" },
        houseNumber: [{ type: "number" }, { type: "string" }],
        city: { type: "string" },
        country: { type: "string" },
      },
    },
    person: {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
        address: { $ref: "#/definitions/address" },
        parent: { $ref: "#/definitions/person" },
        children: {
          type: "array",
          items: { $ref: "#/definitions/person" },
        },
        secondaryAddresses: {
          type: "array",
          items: [{ type: "string" }, { $ref: "#/definitions/address" }],
        },
      },
    },
  },
};
const schema: JSONSchema7 = bringDefinitionToTop(
  rootSchema as JSONSchema7,
  "person",
);

describe("JSONSchema path extraction getSubschemaByPath", () => {
  it("should return the correct subschema for a valid path", () => {
    const citySubschema = getSubschemaByPath(schema, "children.2.address.city");
    expect(citySubschema).toEqual({ type: "string" });
  });

  it("should handle array indices", () => {
    const childNameSubschema = getSubschemaByPath(schema, "children.5.name");
    expect(childNameSubschema).toEqual({ type: "string" });
  });

  it("should handle indexed arrays", () => {
    const prefferedAddressStreetSubschema = getSubschemaByPath(
      schema,
      "secondaryAddresses.1.street",
    );
    expect(prefferedAddressStreetSubschema).toEqual({ type: "string" });

    const preferredAddressHouseNumberSubschema = getSubschemaByPath(
      schema,
      "secondaryAddresses.1.houseNumber",
    );
    expect(preferredAddressHouseNumberSubschema).toEqual([
      { type: "number" },
      { type: "string" },
    ]);

    const preferredAddressNameSubschema = getSubschemaByPath(
      schema,
      "secondaryAddresses.0",
    );
    expect(preferredAddressNameSubschema).toEqual({ type: "string" });
  });

  it("should return undefined for invalid or non-existent paths", () => {
    const invalidSubschema1 = getSubschemaByPath(schema, "children.10.invalid");
    expect(invalidSubschema1).toBeUndefined();

    const invalidSubschema2 = getSubschemaByPath(schema, "non.existent.path");
    expect(invalidSubschema2).toBeUndefined();
  });
});
