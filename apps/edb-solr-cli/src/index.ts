import { AbstractDatastore, QueryType } from "@slub/edb-global-types";
import { LoadResult } from "@slub/sparql-schema";
import fetch from "node-fetch";
import { toJSONLD } from "./toJSONLD";

const solrURL = "http://localhost:8983/solr";

export const solrDatastore: AbstractDatastore = {
  existsDocument(typeName: string, entityIRI: string): Promise<boolean> {
    return Promise.resolve(false);
  },
  findDocuments: async (
    typeName: string,
    query: QueryType,
    limit: number | undefined,
    cb: ((document: any) => Promise<LoadResult>) | undefined,
  ): Promise<any[]> => {
    const result = (await (
      await fetch(
        `${solrURL}/${typeName}/select?q=${query.search ? `title:*${query.search}` : "*:"}*&rows=` +
          limit,
      )
    ).json()) as any;
    if (result.error) {
      throw new Error(result.error);
    } else {
      if (result.response.docs) {
        return result.response.docs.map((doc: any) => toJSONLD(doc));
      } else {
        return [];
      }
    }
  },
  importDocument(
    typeName: string,
    entityIRI: any,
    importStore: AbstractDatastore,
  ): Promise<any> {
    return Promise.resolve(undefined);
  },
  importDocuments(
    typeName: string,
    importStore: AbstractDatastore,
    limit: number,
  ): Promise<any> {
    return Promise.resolve(undefined);
  },
  iterableImplementation: undefined,
  listDocuments(
    typeName: string,
    limit: number | undefined,
    cb: ((document: any) => Promise<any>) | undefined,
  ): Promise<any[]> {
    return Promise.resolve([]);
  },
  loadDocument: async (typeName: string, entityIRI: string): Promise<any> => {
    const result = (await (
      await fetch(
        `${solrURL}/${typeName}/select?q=_id:"${encodeURIComponent(entityIRI)}"`,
      )
    ).json()) as any;
    if (result.error) {
      throw new Error(result.error);
    } else {
      if (result.response.docs) {
        return toJSONLD(result.response.docs[0]);
      } else {
        return undefined;
      }
    }
  },
  removeDocument(typeName: string, entityIRI: string): Promise<any> {
    return Promise.resolve(undefined);
  },
  typeIRItoTypeName(iri: string): string {
    return "";
  },
  typeNameToTypeIRI(typeName: string): string {
    return "";
  },
  upsertDocument: async (
    typeName: string,
    entityIRI: string,
    document: any,
  ): Promise<any> => {
    const result = (await (
      await fetch(`${solrURL}${typeName}/update?commit=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(document),
      })
    ).json()) as any;
    return result;
  },
};

//console.log(await solrDatastore.findDocuments("Exhibition", {search: "Otto"}, 10))

console.log(
  await solrDatastore.loadDocument(
    "Exhibition",
    "http://ontologies.slub-dresden.de/exhibition/entity#b7748b40-b15b-4a6d-8f13-e65088232080",
  ),
);
