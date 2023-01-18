import {QueryEngine} from '@comunica/query-sparql'
import {BindingsStream, IDataSource} from '@comunica/types'
import {Literal, NamedNode} from '@rdfjs/types'

import {rdfLiteralToNative} from '../primitives'
import {Prefixes} from '../types'
import {prefixes2sparqlPrefixDeclaration} from './index'

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
  single?: boolean
  optional?: boolean
  predicateURI: string
}

type LiteralMappingTarget = MappingTarget & {
  kind?: 'literal' | undefined,
  type: keyof TypeMapping
}

type ObjectMappingTarget = MappingTarget & {
  kind: 'object',
  type: 'NamedNode' | 'BlankNode'
  includeLabel?: boolean
  includeDescription?: boolean
}

export const isLiteralMappingTarget = (target: MappingTarget): target is LiteralMappingTarget => (target.kind === undefined || target.kind === 'literal')
export const isObjectMappingTarget = (target: MappingTarget): target is ObjectMappingTarget => target.kind === 'object'


export type FieldMapping = {
  [k: string]: LiteralMappingTarget | ObjectMappingTarget
}

type SparqlSelectViaFieldMappingOptions = {
  fieldMapping: FieldMapping
  wrapAround?: [string, string]
  prefixes?: Prefixes
  permissive: boolean
  sources: [IDataSource,...IDataSource[]]
  includeLabel?: boolean
  includeDescription?: boolean
}

export const sparqlSelectFieldsQuery = (uri: string, { fieldMapping, wrapAround, includeLabel, includeDescription }: Pick<SparqlSelectViaFieldMappingOptions, 'fieldMapping'| 'wrapAround' | 'includeLabel' | 'includeDescription'>) => {
  const [before, after] = wrapAround || ['', '']
  let whereMapping = ''
  if(includeLabel || includeDescription ) {
    whereMapping += before
    if(includeLabel)  whereMapping += `${uri} rdfs:label ?label .`
    if(includeDescription) whereMapping += `${uri} schema:description ?description .`
    whereMapping += after
  }
  whereMapping += Object.entries(fieldMapping).map(([k, v]) => {
    let where = v.optional ? 'OPTIONAL { ' : ''
    if(isObjectMappingTarget(v) && (v.includeLabel || v.includeDescription)) {
      where += `
      ${before}
         ${uri} ${v.predicateURI} ?${k} .` +
         v.includeLabel ? `?${k} rdfs:label ?${k}Label .` : '' +
         v.includeDescription ? `?${k} schema:description ?${k}Description .` : '' +
      `${after}`
    } else {
      where += `${uri} ${v.predicateURI} ?${k} .`
    }
    where += v.optional ? ' }' : ''
    return where
  }).join('\n')
  return `
    SELECT * WHERE {
       ${whereMapping}
    }
    `
}

export const sparqlSelectViaFieldMappings = async (subjectIRI: string, {prefixes, permissive, sources, ...params}: SparqlSelectViaFieldMappingOptions) => {
  const myEngine = new QueryEngine()

  const sparqlQuery = `
    ${prefixes ? prefixes2sparqlPrefixDeclaration(prefixes) : ''}
    ${sparqlSelectFieldsQuery(subjectIRI, params)}
    `
  const bindingsStream: BindingsStream = await myEngine.queryBindings(sparqlQuery, { sources })

  type TypesSupported = string | number | boolean | Date
  const result: { [k: string]: TypesSupported | TypesSupported[] } = {}

  for (const binding of await bindingsStream.toArray()) {
    Object.entries({
      ...params.fieldMapping,
      ...(params.includeLabel ?
          {label: {kind: 'literal', type: 'xsd:string', predicateURI: 'rdfs:label', single: true}} : {}),
      ...(params.includeDescription ?
          {description: {kind: 'literal', type: 'xsd:string', predicateURI: 'schema:description', single: true}} : {})
    }).forEach(([k, v]) => {
      const kLabel = `${k}Label`,
          kDescription = `${k}Description`,
          o = binding.get(k)
      if(!o) return
      if (isLiteralMappingTarget(v)) {
        const literal = o as Literal
        const native: string | number | boolean | Date = rdfLiteralToNative(literal)
        if (v.single) {
          if (!permissive) {
            if (result[k] !== undefined || result[k] !== null || result[k] !== native) throw new Error('got multiple results for a single value')
          }
          result[k] = native
        } else {
          if (!Array.isArray(result[k]) || (result[k] as TypesSupported[]).includes(native))
            result[k] = [...((result[k] || []) as TypesSupported[] | []), native]
        }
      } else if(isObjectMappingTarget(v)) {
        const object = o as NamedNode
        const native = object.value
        let label, description
        if(v.includeLabel) {
          label = (binding.get(kLabel) as Literal).value
        }
        if(v.includeDescription) {
          description = (binding.get(kDescription) as Literal).value
        }
        if (v.single) {
          if (!permissive) {
            if (result[k] !== undefined || result[k] !== null || result[k] !== native) throw new Error('got multiple results for a single value')
          }
          result[k] = native
          if(label) result[kLabel] = label
          if(description) result[kDescription] = description
        } else {
          if (!Array.isArray(result[k]) || (result[k] as TypesSupported[]).includes(native)) {
            result[k] = [...((result[k] || []) as TypesSupported[] | []), native]
            if(label) result[kLabel] = [...((result[kLabel] || []) as TypesSupported[] | []), label]
            if(description) result[kDescription] = [...((result[kDescription] || []) as TypesSupported[] | []), description]
          }
        }
      }
    })
  }
  return result

}
