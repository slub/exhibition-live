import { JSONSchema7 } from "json-schema";
import { prepareStubbedSchema } from "./stubHelper";

const schema: JSONSchema7 = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://example.com/person.schema.json",
  definitions: {
    Person: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        worksFor: { $ref: "#/definitions/Organization" },
      },
    },
    Organization: {
      properties: {
        title: { type: "string" },
      },
    },
  },
};
describe("JSON Schema Utility Functions", () => {
  it("should generate a normal stub", () => {
    const stub = prepareStubbedSchema(schema);
    //const fd = fs.openSync('stub.json', 'w');
    //fs.writeSync(fd,  JSON.stringify(stub, null, 2));
    //fs.closeSync(fd);
    expect(stub).toEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "https://example.com/person.schema.json",
      definitions: {
        PersonStub: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            description: {
              type: "string",
            },
          },
        },
        OrganizationStub: {
          properties: {
            title: {
              type: "string",
            },
          },
        },
        Person: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            description: {
              type: "string",
            },
            worksFor: {
              $ref: "#/definitions/OrganizationStub",
            },
          },
        },
        Organization: {
          properties: {
            title: {
              type: "string",
            },
          },
        },
      },
    });
  });
});
