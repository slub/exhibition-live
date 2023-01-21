import {findAllRefs, JsonSchema7} from '@jsonforms/core'
import {CONSTRUCT} from '@tpluscode/sparql-builder'
import {JSONSchema7} from 'json-schema'
import jsonref from 'jsonref'

import {BASE_IRI} from '../../config'
import {exhibitionPrefixes} from '../../exhibtion'
import {isJSONSchema, isJSONSchemaDefinition} from '../core/jsonSchema'


const MAX_RECURSION = 10
const makePrefixed = (key: string) => key.includes(':') ? key : `:${key}`
const base_iri = BASE_IRI
const jsonSchema2construct = (subjectURI: string, rootSchema: JSONSchema7) => {
  let construct = '', where = '', varIndex = 0
  const s = `<${subjectURI}>`
  const propertiesToSPARQLPatterns = (sP: string, subSchema: JSONSchema7, level: number) => {
    if(level > MAX_RECURSION) {
      console.warn(`will stop at level ${level} to prevent infinite loop because MAX_RECURSION is set to ${MAX_RECURSION}`)
      return
    }
    Object.entries(subSchema.properties || {}).map(([property,schema]) => {
      if(isJSONSchema(schema)) {
        const required = subSchema.required?.includes(property),
            p = makePrefixed(property),
            o = `?${property}_${varIndex++}`
        if(!required) { where += 'OPTIONAL {\n' }
          construct += `${sP} ${p} ${o} .\n`
          where += `${sP} ${p} ${o} .\n`
          if(schema.properties) {
            propertiesToSPARQLPatterns(o, schema, level + 1)
          }
          if(isJSONSchemaDefinition(schema.items) && isJSONSchema(schema.items) && schema.items.properties) {
            propertiesToSPARQLPatterns(o, schema.items, level + 1)
          }
          if(schema.$ref) {
            const allRefs = findAllRefs(rootSchema as JsonSchema7)
            const subSchema = allRefs[schema.$ref]
            if(subSchema) {
              propertiesToSPARQLPatterns(o, subSchema as JSONSchema7, level + 1)
            }

          }
        if(!required) { where += '}\n' }
      }
    })
  }
  propertiesToSPARQLPatterns(s, rootSchema, 0)
  if(isJSONSchemaDefinition(rootSchema.items) && isJSONSchema(rootSchema.items) && rootSchema.items.properties) {
    propertiesToSPARQLPatterns(s, rootSchema.items, 0)
  }
  return { construct, where }
}


export const buildConstructQuery = (subjectURI: string,schema: JSONSchema7) => {
  const {
    construct, where
  } = jsonSchema2construct(subjectURI, schema)
  return CONSTRUCT`${construct}`.WHERE`${where}`.build({
    base: base_iri,
    prefixes: {
      ...exhibitionPrefixes
    }
  }).toString()
}
