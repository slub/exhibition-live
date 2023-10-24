import { QueryEngine } from "@comunica/query-sparql";
import { BindingsStream, IDataSource } from "@comunica/types";
import { Literal } from "@rdfjs/types";

import { prefixes2sparqlPrefixDeclaration } from "../sparql";
import { wikidataPrefixes } from "./prefixes";

const buildPropsQuery = (thingIRI: string) => `
SELECT ?property ?propLabel ?object ?objectLabel 
WHERE {

  <${thingIRI}> wdt:P31 ?class .
           
  OPTIONAL { 
    ?class wdt:P1963 ?property .
    ?property wikibase:directClaim ?directProperty .
    SERVICE wikibase:label {
        bd:serviceParam wikibase:language "de" .
        ?property rdfs:label ?propLabel .
    }
    <${thingIRI}> ?directProperty ?object  .
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

export const getCommonPropsFromWikidata: (
  thingIRI: string,
  sources: [IDataSource, ...IDataSource[]],
) => Promise<undefined | CommonPropertyValues> = async (thingIRI, sources) => {
  const myEngine = new QueryEngine();

  const sparqlQuery = `
    ${prefixes2sparqlPrefixDeclaration(wikidataPrefixes)}
    ${buildPropsQuery(thingIRI)}
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
    const objects = properties.get(property)?.objects as any;
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
    props[key] = value;
  }

  return props;
};
