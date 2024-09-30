import Elysia, { t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { JSONSchema7 } from "json-schema";
import {
  convertDefsToDefinitions,
  defs,
  extendSchemaShortcut,
  propertyExistsWithinSchema,
} from "@slub/json-schema-utils";
import { getGraphQLWriter, getJsonSchemaReader, makeConverter } from "typeconv";
import { cors } from "@elysiajs/cors";
import { yoga } from "@elysiajs/graphql-yoga";
import { FieldNode, SelectionSetNode } from "graphql";
import { IExecutableSchemaDefinition } from "@graphql-tools/schema";
import { IFieldResolver } from "@graphql-tools/utils";
import { primaryFields, schema } from "@slub/exhibition-schema";
import { filterUndefOrNull, replaceJSONLD } from "@slub/edb-core-utils";
import qs from "qs";
import * as process from "process";
import { PrismaClient } from "@prisma/edb-exhibition-client";
import config from "@slub/exhibition-sparql-config";
import { initPrismaStore } from "@slub/prisma-db-impl";
import { typeIRItoTypeName, typeNameToTypeIRI } from "./dataStore";

console.log(process.env.DATABASE_PROVIDER);
const schemaName = `${schema.title || schema.$id || "unnamed schema"}`;

const exhibitionSchema = extendSchemaShortcut(
  schema as JSONSchema7,
  "_type",
  "_id",
);
const rootSchema = extendSchemaShortcut(schema as JSONSchema7, "type", "id");
const prisma = new PrismaClient();
const dataStore = initPrismaStore(prisma, rootSchema, primaryFields, {
  jsonldContext: config.defaultJsonldContext,
  defaultPrefix: config.defaultPrefix,
  typeIRItoTypeName: typeIRItoTypeName,
  typeNameToTypeIRI: typeNameToTypeIRI,
});
//bun only runs if we call it here: why??
//find first object that can be counted:
for (const key of Object.keys(prisma)) {
  if (prisma[key]?.count) {
    const c = await prisma[key].count();
    console.log(c);
    break;
  }
}

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

const availableTypeNames = Object.keys(defs(exhibitionSchema));

const sortingToQuery = (sorting: string[], typeName: string) => {
  return filterUndefOrNull(
    sorting?.map((s) => {
      const sort = s.split(" ");
      const propertyPath = sort[0];
      if (propertyPath === "IRI")
        return { id: "IRI", desc: sort[1] === "desc" };
      const exists = propertyExistsWithinSchema(
        typeName,
        propertyPath,
        exhibitionSchema,
      );
      if (!exists) {
        console.warn(
          `Property ${propertyPath} does not exist in schema ${typeName}`,
        );
        return null;
      }
      return { id: propertyPath, desc: sort[1] === "desc" };
    }),
  );
};

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

const typeNameOption = t.Union(availableTypeNames.map((s) => t.Literal(s)));

const app = new Elysia()
  .use(
    cors({
      methods: ["GET", "POST", "DELETE", "PUT"],
    }),
  )
  .use(graphqlAPI)
  .onTransform((ctx) => {
    const parsed = qs.parse(new URL(ctx.request.url).search.slice(1));
    // @ts-expect-error
    ctx.query = parsed;
  })
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
        typeName: typeNameOption,
      }),
      detail: {
        summary: "List documents of a certain type",
        description:
          "List documents of a certain type, specified by typeName, optionally limited by limit",
      },
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
        typeName: typeNameOption,
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
        typeName: typeNameOption,
      }),
      response: t.Boolean(),
    },
  )
  .get(
    "/findDocuments/:typeName",
    async ({ params: { typeName }, query }) => {
      const { limit, sorting, ...q } = query;
      //const
      return dataStore.findDocuments(
        typeName,
        {
          search: q.search,
          sorting: sorting ? sortingToQuery(sorting, typeName) : [],
        },
        limit,
      );
    },
    {
      query: t.Object({
        sorting: t.Optional(t.Array(t.String())),
        search: t.Optional(t.String()),
        limit: t.Optional(t.Numeric()),
      }),
      params: t.Object({
        typeName: typeNameOption,
      }),
    },
  )
  .get(
    "/classes",
    async ({ query: { id } }) => {
      if (!dataStore.getClasses)
        throw new Error("This data store does not support classes");
      return dataStore.getClasses(id);
    },
    {
      query: t.Object({
        id: t.String(),
      }),
    },
  )
  .get(
    `/findDocumentsByLabel/:typeName/`,
    async ({ params: { typeName }, query }) => {
      if (!dataStore.findDocumentsByLabel) {
        throw new Error(
          "This data store does not support finding documents by label",
        );
      }
      return dataStore.findDocumentsByLabel(typeName, query.label, query.limit);
    },
    {
      query: t.Object({
        limit: t.Optional(t.Numeric()),
        label: t.String(),
      }),
      params: t.Object({
        typeName: typeNameOption,
      }),
    },
  )
  .get(
    "/findDocumentsAsFlat/:typeName",
    async ({ params: { typeName }, query }) => {
      const { limit, ...q } = query;
      if (!dataStore.findDocumentsAsFlatResultSet) {
        throw new Error("This data store does not support flat result sets");
      }
      return dataStore.findDocumentsAsFlatResultSet(
        typeName,
        {
          search: q.search,
          sorting: q.sorting ? sortingToQuery(q.sorting, typeName) : [],
        },
        limit,
      );
    },
    {
      query: t.Object({
        sorting: t.Optional(t.Array(t.String())),
        search: t.Optional(t.String()),
        limit: t.Optional(t.Numeric()),
      }),
      params: t.Object({
        typeName: typeNameOption,
      }),
    },
  )
  .get(
    `/findDocumentsByAuthorityIRI/:typeName/`,
    async ({ params: { typeName }, query }) => {
      if (!dataStore.findDocumentsByAuthorityIRI) {
        throw new Error(
          "This data store does not support finding documents by authority IRI",
        );
      }
      return dataStore.findDocumentsByAuthorityIRI(
        typeName,
        query.authorityIRI,
        query.repositoryIRI,
        query.limit,
      );
    },
    {
      query: t.Object({
        limit: t.Optional(t.Numeric()),
        authorityIRI: t.String(),
        repositoryIRI: t.Optional(t.String()),
      }),
      params: t.Object({
        typeName: typeNameOption,
      }),
    },
  )
  .put(
    "/upsertDocument/:typeName",
    async ({ params: { typeName }, body }) => {
      const entityIRI = (body as any)["@id"];
      if (!entityIRI) throw new Error("Entity IRI is required");
      return dataStore.upsertDocument(typeName, entityIRI, body);
    },
    {
      params: t.Object({
        typeName: typeNameOption,
      }),
      body: t.Object(
        {
          "@id": t.String(),
        },
        { additionalProperties: true },
      ),
    },
  )
  //delete an entity
  .delete(
    "/removeDocument/:typeName",
    ({ params: { typeName }, query: { id } }) => {
      return Boolean(dataStore.removeDocument(typeName, id));
    },
    {
      params: t.Object({
        typeName: typeNameOption,
      }),
      query: t.Object({
        id: t.String(),
      }),
    },
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: `EDB API (${schemaName})`,
          version: process.env.npm_package_version || "0.0.0.",
          description: `API for ${schemaName}`,
        },
      },
    }),
  )
  .listen(3001);

console.log(
  `🦊 Elysia powered EDB (${schemaName}) is running at ${app.server?.hostname}:${app.server?.port}`,
);
