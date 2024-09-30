import { bringDefinitionToTop } from "./jsonSchema";
import { resolveAndWalkJSONSchema, walkJSONSchema } from "./walkJSONSchema";
import { JSONSchema7 } from "json-schema";

describe("walkJSONSchema", () => {
  it("should walk through a JSON schema and call appropriate callbacks", () => {
    const schema: JSONSchema7 = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
        address: {
          type: "object",
          properties: {
            street: { type: "string" },
            city: { type: "string" },
          },
        },
        hobbies: {
          type: "array",
          items: { type: "string" },
        },
      },
    };

    const callbacks = {
      onEnterProperty: jest.fn(),
      onExitProperty: jest.fn(),
      onObject: jest.fn(),
      onArray: jest.fn(),
      onLiteral: jest.fn(),
    };

    walkJSONSchema(schema, { callbacks });

    expect(callbacks.onObject).toHaveBeenCalledTimes(2);
    expect(callbacks.onArray).toHaveBeenCalledTimes(1);
    expect(callbacks.onLiteral).toHaveBeenCalledTimes(5);
    expect(callbacks.onEnterProperty).toHaveBeenCalledTimes(6);
    expect(callbacks.onExitProperty).toHaveBeenCalledTimes(6);

    expect(callbacks.onEnterProperty).toHaveBeenCalledWith(
      "name",
      { type: "string" },
      ["name"],
    );
    expect(callbacks.onLiteral).toHaveBeenCalledWith(
      { type: "string" },
      "string",
      ["name"],
    );
  });

  it("should handle complex schema with $refs and circular relationships", () => {
    const schema: JSONSchema7 = bringDefinitionToTop(
      {
        $id: "https://example.com/schemas/person",
        type: "object",
        definitions: {
          address: {
            type: "object",
            properties: {
              street: { type: "string" },
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
              parent: { $ref: "#/definitions/person" }, // Circular reference
              children: {
                type: "array",
                items: { $ref: "#/definitions/person" }, // Circular reference
              },
            },
          },
        },
      },
      "person",
    );

    const callbacks = {
      onEnterProperty: jest.fn(),
      onExitProperty: jest.fn(),
      onObject: jest.fn(),
      onArray: jest.fn(),
      onLiteral: jest.fn(),
      onRef: jest.fn(),
    };

    resolveAndWalkJSONSchema(schema, schema, { callbacks, maxDepth: 3 });

    expect(callbacks.onObject).toHaveBeenCalledTimes(4); // address, person, person, person
    expect(callbacks.onArray).toHaveBeenCalledTimes(3); // children
    expect(callbacks.onLiteral).toHaveBeenCalledTimes(9); // name, age, street, city, country
    expect(callbacks.onEnterProperty).toHaveBeenCalledTimes(18); // All properties including those in definitions
    expect(callbacks.onExitProperty).toHaveBeenCalledTimes(18); // All properties including those in definitions
    expect(callbacks.onRef).toHaveBeenCalledTimes(8); // address, parent, children

    // Check specific calls
    expect(callbacks.onRef).toHaveBeenCalledWith(
      "#/definitions/address",
      expect.any(Object),
      ["address"],
    );
    expect(callbacks.onRef).toHaveBeenCalledWith(
      "#/definitions/person",
      expect.any(Object),
      ["parent"],
    );
    expect(callbacks.onRef).toHaveBeenCalledWith(
      "#/definitions/person",
      expect.any(Object),
      ["children", "items"],
    );

    // Check that circular references don't cause infinite loops
    expect(callbacks.onEnterProperty).toHaveBeenCalledWith(
      "parent",
      expect.any(Object),
      ["parent"],
    );
    expect(callbacks.onEnterProperty).toHaveBeenCalledWith(
      "children",
      expect.any(Object),
      ["children"],
    );
  });
});
