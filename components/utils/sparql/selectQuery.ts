import {QueryEngine} from "@comunica/query-sparql";
import {BindingsStream} from "@comunica/types";
import {Literal} from "@rdfjs/types";
import {rdfLiteralToNative} from "../primitives";
import {prefixes2sparqlPrefixDeclaration} from "./index";
import {Prefixes} from "../types";

type TypeMapping = {
  'xsd:string': string,
  'xsd:integer': number,
  'xsd:float': number,
  'xsd:double': number,
  'xsd:boolean': boolean,
  'xsd:date': Date,
  'xsd:dateTime': Date,
  'xsd:time': Date,
}

type MappingTarget = {
  kind?: 'literal' | 'object'
  single?: boolean,
  predicateURI: string
}

type LiteralMappingTarget = MappingTarget & {
  kind?: 'literal' | undefined,
  type: keyof TypeMapping
}

type ObjectMappingTarget = MappingTarget & {
  kind: 'object',
  type: 'NamedNode' | 'BlankNode'
}

export const isLiteralMappingTarget = (target: MappingTarget): target is LiteralMappingTarget => (target.kind === undefined || target.kind === 'literal')
export const isObjectMappingTarget = (target: MappingTarget): target is ObjectMappingTarget => target.kind === 'object'


export type FieldMapping = {
  [k: string]: LiteralMappingTarget | ObjectMappingTarget
}

export const sparqlSelectFieldsQuery = (uri: string, fieldMapping: FieldMapping) => {
  const whereMapping = Object.entries(fieldMapping).map(([k, v]) => {
    return `${v.predicateURI} ?${k} `
  }).join(';')
  return `
    SELECT * WHERE {
      ${uri} ${whereMapping} .
    }
    `
}


export const sparqlSelectViaFieldMappings = async (subjectIRI: string, fieldMapping: FieldMapping, prefixes: Prefixes, permissive: boolean) => {
  const myEngine = new QueryEngine();

  const sparqlQuery = `
    ${prefixes2sparqlPrefixDeclaration(prefixes)}
    ${sparqlSelectFieldsQuery(subjectIRI, fieldMapping)}
    `
  const bindingsStream: BindingsStream = await myEngine.queryBindings(sparqlQuery, {
        sources: ['http://localhost:9999/blazegraph/namespace/kb/sparql'],
      }
  );

  type TypesSupported = string | number | boolean | Date
  let result: { [k: string]: TypesSupported | TypesSupported[] } = {}

  for (const binding of await bindingsStream.toArray()) {
    Object.entries(fieldMapping).forEach(([k, v]) => {
      if (isLiteralMappingTarget(v)) {
        const literal = binding.get(k) as Literal
        const native: string | number | boolean | Date = rdfLiteralToNative(literal)
        if (v.single) {
          if (!permissive) {
            if (result[k] !== undefined || result[k] !== null || result[k] !== native) throw new Error('got multiple results for a single value')
          }
          result[k] = native
        } else {
          if (!Array.isArray(result[k]) || (result[k] as TypesSupported[]).includes(native))
            result[k] = [...(result[k] as TypesSupported[] | []), native]
        }
      }
    })
  }
  return result

}
