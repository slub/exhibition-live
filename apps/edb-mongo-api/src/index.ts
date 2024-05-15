import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { closeConnection, database } from "./connect";
import { swagger } from "@elysiajs/swagger";
import { Collection } from "mongodb";

const ensureIndex = (collection: Collection<any>) => {
  if (!collection.indexExists("@id")) collection.createIndex({ "@id": 1 });
};
const postDocument: (
  typeName: string,
  entityIRI: string,
  document: any,
) => Promise<any> = async (
  typeName: string,
  entityIRI: string,
  document: any,
) => {
  const coll = database.collection(typeName);
  ensureIndex(coll);
  return coll.findOneAndReplace({ "@id": entityIRI }, document, {
    upsert: true,
  });
};
export const app = new Elysia()
  .use(cors())
  .get("/", () => "Welcome to SLUb EDB Mongo API")
  .get(
    "/document/:typeName/:entityIRI",
    async ({ params: { typeName, entityIRI } }) => {
      const id = decodeURIComponent(entityIRI),
        coll = database.collection(typeName);
      return (await coll.findOne({ "@id": id })) || {};
    },
    {
      params: t.Object({
        typeName: t.String(),
        entityIRI: t.String(),
      }),
      response: t.Any(),
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
  // @ts-ignore
  .use(swagger())
  .listen(3002);

export type App = typeof app;

app.onStop(() => {
  console.log(
    `🦊 Elysia powered SLUB EDB Mongo API is shutting down at ${app.server?.hostname}:${app.server?.port}`,
  );
  closeConnection();
});
console.log(
  `🦊 Elysia powered SLUB EDB Mongo API is running at ${app.server?.hostname}:${app.server?.port}`,
);
