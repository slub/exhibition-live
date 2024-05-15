import { JSONSchema7 } from "json-schema";
import { jsonSchema2Prisma, n2MTable } from "./jsonSchema2Prisma";
import { PrimaryFieldDeclaration } from "@slub/edb-core-types";
import { jsonSchema2PrismaFlatSelect } from "./jsonSchema2PrismaFlatSelect";

const schema: JSONSchema7 = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://example.com/person.schema.json",
  title: "Human",
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
          label: { type: "string" },
          loves: {
            type: "array",
            items: {
              required: ["name"],
              properties: {
                name: { type: "string" },
              },
            },
          },
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
  definitions: {
    Person: {
      type: "object",
      properties: {
        "@id": { type: "string" },
        "@type": { type: "string" },
        name: { type: "string" },
        description: { type: "string" },
      },
    },
    Organization: {
      properties: {
        "@id": { type: "string" },
        "@type": { type: "string" },
        title: { type: "string" },
      },
    },
    Human: {
      title: "Human",
      description: "A human being",
      type: "object",
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
        worksFor: {
          $ref: "#/definitions/Organization",
        },
        mother: {
          $ref: "#/definitions/Person",
        },
        children: {
          items: {
            $ref: "#/definitions/Person",
          },
        },
      },
      required: ["name", "father"],
    },
  },
};
const primaryFieldsDecl: PrimaryFieldDeclaration = {
  Human: {
    label: "name",
  },
  Person: {
    label: "name",
  },
  Organization: {
    label: "title",
  },
};
describe("convert json schema to prisma select query", () => {
  test("simple schema to flat select", () => {
    const query = jsonSchema2PrismaFlatSelect(
      "Person",
      schema2,
      primaryFieldsDecl,
      {
        takeLimit: 10,
        includeAttributes: true,
      },
    );
    expect(query).toStrictEqual({
      include: { id: true, type: true, name: true, description: true },
    });
  });
  test("convert schema with relations", () => {
    const query = jsonSchema2PrismaFlatSelect(
      "Human",
      schema2,
      primaryFieldsDecl,
      { takeLimit: 10 },
    );
    //console.log(JSON.stringify(query, null ,2))
    expect(query).toStrictEqual({
      include: {
        worksFor: {
          select: {
            id: true,
            title: true,
          },
        },
        mother: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          take: 10,
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          children: true,
        },
      },
    });
  });
});
