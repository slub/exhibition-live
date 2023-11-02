import { QueryEngine } from "@comunica/query-sparql";
import { BindingsStream, IDataSource } from "@comunica/types";
import { Literal } from "@rdfjs/types";

import { prefixes2sparqlPrefixDeclaration } from "../sparql";
import { wikidataPrefixes } from "./prefixes";
import isNil from "lodash/isNil";

const buildPropsQuery = (entity: string, withSubclassRelations?: boolean) => `
SELECT ?property ?propLabel ?object ?objectLabel
WHERE {

  ${entity} ${withSubclassRelations ? "wdt:P31/wdt:P279*" : "wdt:P31"} ?class .

  OPTIONAL {
    ?class wdt:P1963 ?property .
    ?property wikibase:directClaim ?directProperty .
    SERVICE wikibase:label {
        bd:serviceParam wikibase:language "de" .
        ?property rdfs:label ?propLabel .
    }
    ${entity} ?directProperty ?object  .
    OPTIONAL {
      SERVICE wikibase:label {
        bd:serviceParam wikibase:language "de" .
        ?object rdfs:label ?objectLabel .
     }
   }
 }
}`;

export type CommonPropertyValues = {
  [p: string]: {
    label: string;
    objects: (
      | Literal
      | { termType: "NamedNode"; label: string; uri: string }
    )[];
  };
};

const dedup = function (arr: any[]) {
  return arr.reduce(
    (prev, cur) =>
      (!isNil(cur.uri) && prev.find((x) => x.uri === cur.uri)) ||
      (!isNil(cur.value) && prev.find((x) => x.value === cur.value))
        ? prev
        : [...prev, cur],
    [],
  );
};

export const getCommonPropsFromWikidata: (
  thingIRI: string,
  sources: [IDataSource, ...IDataSource[]],
  withSubClassRelations?: boolean,
) => Promise<undefined | CommonPropertyValues> = async (
  thingIRI,
  sources,
  withSubClassRelations,
) => {
  const myEngine = new QueryEngine();

  const sparqlQuery = `
    ${prefixes2sparqlPrefixDeclaration(wikidataPrefixes)}
    ${buildPropsQuery(
      thingIRI.startsWith("Q") ? `wd:${thingIRI}` : `<${thingIRI}>`,
      withSubClassRelations,
    )}
    `;
  const bindingsStream: BindingsStream = await myEngine.queryBindings(
    sparqlQuery,
    { sources },
  );
  const properties = new Map<string, CommonPropertyValues>();
  for (const binding of await bindingsStream.toArray()) {
    const property = binding.get("property")?.value;
    if (!property) continue;
    const propLabel = binding.get("propLabel")?.value;
    const object = binding.get("object");
    if (!object) continue;
    const objectLabel = binding.get("objectLabel")?.value;
    const objects = properties.get(property)?.objects || ([] as any);
    if (object.termType === "NamedNode") {
      properties.set(property, {
        label: propLabel || "",
        objects: [
          ...objects,
          { termType: "NamedNode", label: objectLabel, uri: object.value },
        ],
      } as any);
    } else {
      properties.set(property, {
        label: propLabel || "",
        objects: [...objects, object],
      } as any);
    }
  }

  //convert Map to dictionary
  const props: CommonPropertyValues = {};
  // @ts-ignore
  for (const [key, value] of properties.entries()) {
    props[key] = { label: value.label, objects: dedup(value.objects) };
  }

  return props;
};
