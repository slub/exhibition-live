import { Elysia, t } from "elysia";
import { JSONSchema7 } from "json-schema";
import { cors } from "@elysiajs/cors";
import loadedSchema from "@slub/exhibition-schema/schemas/jsonschema/Exhibition.schema.json";
import { swagger } from "@elysiajs/swagger";
import { defs } from "@slub/json-schema-utils";
import { database, surrealDatastore } from "./surrealDatastore";
import { dataStore } from "./dataStore";

const exhibitionSchema = loadedSchema as JSONSchema7;
const datastore = surrealDatastore;
const importDatastore = dataStore;
const postDocument: (
  typeName: string,
  entityIRI: string,
  document: any,
) => Promise<any> = async (
  typeName: string,
  entityIRI: string,
  document: any,
) => {
  return surrealDatastore.upsertDocument(typeName, entityIRI, document);
};
export const app = new Elysia()
  .use(cors())
  .get("/", () => "Welcome to SLUb EDB Surreal API")

  .put("/importAll", async () => {
    const types = Object.keys(defs(exhibitionSchema));
    let importCount = 0;
    await Promise.all(
      types.map(async (typeName) => {
        const items = await importDatastore.listDocuments(typeName, 10000);
        await Promise.all(
          items.map(async ({ value }: { value: string }, idx) => {
            console.log(
              `importing:  ${typeName} ${value} (${importCount} of all- ${idx + 1}/${items.length} ${typeName}-items)`,
            );
            importCount++;
            const entityIRI = value;
            const item = await importDatastore.loadDocument(
              typeName,
              entityIRI,
            );
            return await postDocument(typeName, entityIRI, item);
          }),
        );
      }),
    );
    return importCount;
  })
  .put(
    "/importAll/:typeName",
    async ({ params: { typeName } }) => {
      const items = await importDatastore.listDocuments(typeName, 10000);
      return await Promise.all(
        items.map(async ({ value }: { value: string }) => {
          console.log("importing: ", value);
          const entityIRI = value;
          const item = await importDatastore.loadDocument(typeName, entityIRI);
          return await postDocument(typeName, entityIRI, item);
        }),
      );
    },
    {
      params: t.Object({
        typeName: t.String(),
      }),
    },
  )
  .put(
    "/import/:typeName/:id",
    async ({ params }) => {
      const { typeName, id } = params;
      console.log("will import", typeName, id);
      const entityIRI = decodeURIComponent(id);
      const item = await dataStore.loadDocument(typeName, entityIRI);
      return await postDocument(typeName, entityIRI, item);
    },
    {
      params: t.Object({
        typeName: t.String(),
        id: t.String(),
      }),
    },
  )
  .get(
    "/documentById/:typeName/:id",
    async ({ params: { typeName, id } }) => {
      return await datastore.loadDocument(typeName, decodeURIComponent(id));
    },
    {
      params: t.Object({
        typeName: t.String(),
        id: t.String(),
      }),
      response: t.Any(),
    },
  )
  .get(
    "/document/:typeName",
    async ({ params: { typeName } }) => {
      return datastore.listDocuments(typeName);
    },
    {
      params: t.Object({
        typeName: t.String(),
      }),
    },
  )
  .post(
    "/document",
    async ({ body }) => {
      const { typeName, entityIRI, data } = body;
      return await postDocument(typeName, entityIRI, data);
    },
    {
      body: t.Object({
        typeName: t.String(),
        entityIRI: t.String(),
        data: t.Any(),
      }),
    },
  )
  .use(swagger())
  .listen(3002);

export type App = typeof app;

app.onStop(() => {
  console.log(
    `🦊 Elysia powered SLUB EDB Surreal API is shutting down at ${app.server?.hostname}:${app.server?.port}`,
  );
  database.close();
});
console.log(
  `🦊 Elysia powered SLUB EDB Surreal API is running at ${app.server?.hostname}:${app.server?.port}`,
);
