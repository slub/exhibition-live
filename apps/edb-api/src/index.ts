import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { JSONSchema7 } from "json-schema";
import {
  defs,
  convertDefsToDefinitions,
  propertyExistsWithinSchema,
} from "@slub/json-schema-utils";
import { getGraphQLWriter, getJsonSchemaReader, makeConverter } from "typeconv";
import { cors } from "@elysiajs/cors";
import { yoga } from "@elysiajs/graphql-yoga";
import { FieldNode, SelectionSetNode } from "graphql";
import { IExecutableSchemaDefinition } from "@graphql-tools/schema";
import { IFieldResolver } from "@graphql-tools/utils";
import { schema } from "@slub/exhibition-schema";
import { dataStore } from "./dataStore";
import { extendSchema } from "./extendSchema";
import { replaceJSONLD } from "./replaceJSONLD";

const exhibitionSchema = extendSchema(schema as JSONSchema7);

const reader = getJsonSchemaReader();
const writer = getGraphQLWriter();

const converter = makeConverter(reader, writer);
const { data: graphqlTypeDefsUnfiltered } = await converter.convert({
  data: JSON.stringify(convertDefsToDefinitions(exhibitionSchema), null, 2),
});

const graphqlTypeDefs = graphqlTypeDefsUnfiltered
  .split("\n")
  .filter((line) => !new RegExp("[a-zA-Z]_").test(line))
  .join("\n");

//console.log(graphqlTypeDefsUnfiltered);
const getTypeDefs = (schema: JSONSchema7) => {
  const definitions = defs(schema);
  const allDefinitions = Object.keys(definitions)
    .map((typeName) => {
      return `
      get${typeName}(id: ID!): ${typeName}
      list${typeName}(limit: Int): [${typeName}]
    `;
    })
    .join("\n");
  return `
    type Query {
      ${allDefinitions}
    }
    `;
};

const getFieldResolvers = (schema: JSONSchema7) => {
  const definitions = defs(schema);
  const allResolver = Object.keys(definitions).flatMap((typeName) => {
    const resolver: [string, IFieldResolver<any, any>][] = [
      [
        `get${typeName}`,
        async (parent, args, context, info) => {
          const { id } = args;
          const result = await dataStore.loadDocument(typeName, id);
          return replaceJSONLD(result);
        },
      ],
      [
        `list${typeName}`,
        async (parent, args, context, info) => {
          const { limit = 10 } = args;
          return replaceJSONLD(await dataStore.listDocuments(typeName, limit));
        },
      ],
    ];
    return resolver;
  });
  return Object.fromEntries(allResolver);
};

const additionalTypeDefs = getTypeDefs(exhibitionSchema);
const queryResolvers = getFieldResolvers(exhibitionSchema);

const recurseSelectionSet: (selectionSet: SelectionSetNode) => {
  [p: string]: { [p: string]: any } | null;
} = (selectionSet: SelectionSetNode) => {
  return Object.fromEntries(
    selectionSet.selections.map((selection) => {
      const fnode = selection as FieldNode;
      return [
        fnode?.name?.value,
        fnode.selectionSet ? recurseSelectionSet(fnode.selectionSet) : null,
      ];
    }),
  );
};
const gqlSchema: IExecutableSchemaDefinition<any> = {
  typeDefs: [graphqlTypeDefs, additionalTypeDefs].join("\n"),
  resolvers: {
    Query: queryResolvers,
  },
};

const graphqlAPI = yoga({
  typeDefs: gqlSchema.typeDefs,
  context: {
    name: "Mobius",
  },
  // If context is a function on this doesn't present
  // for some reason it won't infer context type
  useContext(_: any) {},
  resolvers: gqlSchema.resolvers,
} as any);

const app = new Elysia()
  .use(cors())
  .use(graphqlAPI)
  .get("/", () => "Welcome to SLUb EDB")
  .get(
    "/listDocument/:typeName",
    async ({ params: { typeName }, query: { limit } }) => {
      return dataStore.listDocuments(typeName, limit);
    },
    {
      query: t.Object({
        limit: t.Optional(t.Numeric()),
      }),
      params: t.Object({
        typeName: t.String(),
      }),
    },
  )
  .get(
    "/loadDocument/:typeName",
    async ({ params: { typeName }, query: { id } }) => {
      return await dataStore.loadDocument(typeName, id);
    },
    {
      query: t.Object({
        id: t.String(),
      }),
      params: t.Object({
        typeName: t.String(),
      }),
      response: t.Any(),
    },
  )
  .get(
    "/existsDocument/:typeName",
    async ({ params: { typeName }, query: { id } }) => {
      return await dataStore.existsDocument(typeName, id);
    },
    {
      query: t.Object({
        id: t.String(),
      }),
      params: t.Object({
        typeName: t.String(),
      }),
      response: t.Boolean(),
    },
  )
  .post(
    "/upsertDocument/:typeName",
    async ({ params: { typeName }, body }) => {
      const entityIRI = (body as any)["@id"];
      if (!entityIRI) throw new Error("Entity IRI is required");
      return dataStore.upsertDocument(typeName, entityIRI, body);
    },
    {
      params: t.Object({
        typeName: t.String(),
      }),
      body: t.Object(
        {
          "@id": t.String(),
        },
        { additionalProperties: true },
      ),
    },
  )
  .use(swagger({ title: "SLUb EDB" }))
  .listen(3001);

console.log(
  `🦊 Elysia powered SLUB EDB is running at ${app.server?.hostname}:${app.server?.port}`,
);
