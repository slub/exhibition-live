import { JSONSchema7 } from "json-schema";
import { jsonSchema2Prisma, n2MTable } from "./jsonSchema2Prisma";

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
  title: "Human",
  description: "A human being",
  type: "object",
  required: ["name", "father"],
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
  },
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
      $ref: "#/definitions/Person",
    },
  },
};
describe("convert json schema to prisma schema", () => {
  test("simple schema", () => {
    const prisma = jsonSchema2Prisma(schema, new WeakSet());
    expect(prisma).toBe(
      `model Human {
  name String
  knows Human_knows[]
  father_name String?
  father_description String?
}

model Human_knows_loves {
  name String
}

model Human_knows {
  nick String
  label String?
  loves Human_knows_loves[]
}`,
    );
  });
  test("schema with self-relation", () => {
    const primsa = jsonSchema2Prisma(
      {
        $schema: "http://json-schema.org/draft-07/schema#",
        $id: "https://example.com/person.schema.json",
        definitions: {
          Person: {
            properties: {
              name: { type: "string" },
              knows: {
                $ref: "#/definitions/Person",
              },
            },
          },
        },
      },
      new WeakSet(),
      {
        reverseMap: {
          knows: "knownBy",
        },
      },
    );
    expect(primsa).toBe(`model Person {
  name String?
  knows_id String?
  knows Person?  @relation("knows", fields: [knows_id], references: [id])
  knownBy Person[] @relation("knows")
}`);
  });
  /*
  test("schema with definitions", () => {
    const prisma = jsonSchema2Prisma(schema2, new WeakSet());
    //const n2m = n2MTable("Human", schema2.properties, new WeakSet());
    const result = prisma
    console.log(result);
    expect(result).toBe(
      `modelAvailable since 4.3.0.

enable in your schema file:

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["filteredRelationCount"] << add this
}
and then query:

await prisma.post.findMany({
  select: {
    _count: {
      select: {
        comment: { where: { approved: true } },
      },
    },
  },
}) Human {
name String
knows Human_knows[]
father Person
}
model Person {
_id String @id
_type String
name String
description String
}




model Human_knows {
nick String
}

`,
    );
  });*/
});
