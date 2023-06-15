import {JsonSchema, resolveSchema} from '@jsonforms/core'
import {JSONSchema7} from 'json-schema'
import {isObject} from 'lodash'

import {filterUndefOrNull} from '../core'
import {filterForPrimitiveProperties} from '../core/jsonSchema'

const MAX_RECURSION = 2

export type GraphQLMappingOptions = {
  propertyBlacklist?: string[]
  maxRecursion?: number
}

const makeProperty = (key: string, propertyString?: string) => {
  if(!propertyString || propertyString.length === 0) return undefined
  return `${key} { 
    ${propertyString} 
  }`
}
const jsonSchemaProperties2GraphQLQuery: (rootProperty: JSONSchema7['properties'], rootSchema: JSONSchema7, options?: GraphQLMappingOptions, level?: number) => (undefined | string) = (rootProperty: JSONSchema7['properties'], rootSchema: JSONSchema7, options?: GraphQLMappingOptions, level: number = 0) => {
  if(level > (options?.maxRecursion || MAX_RECURSION)) return undefined
  const propertiesList = filterUndefOrNull(Object.entries(rootProperty || {}).map(([key, p]) => {
    if(options?.propertyBlacklist?.includes(key) || key.startsWith('@') || !isObject(p)) return undefined
    if( p.type === 'string' || p.type === 'number' || p.type === 'boolean') {
      return key
    }
    if(p.type === 'object' || p.$ref) {
      let properties = p.properties
      if(p.$ref) {
        const subSchema =  resolveSchema(p as JsonSchema, '', rootSchema as JsonSchema) as JSONSchema7
        if(subSchema && subSchema.properties ) {
          properties = subSchema.properties
        }
      }
      if(properties) return  makeProperty(key, jsonSchemaProperties2GraphQLQuery(properties, rootSchema, options, level + 1))
    }
    if(p.type === 'array' && isObject(p.items)) {
      const items = p.items as JSONSchema7
      let properties = items.properties
      if(items.$ref) {
        const subSchema =  resolveSchema(p.items as JsonSchema, '', rootSchema as JsonSchema ) as JSONSchema7
        if(subSchema && subSchema.properties ) {
          properties = subSchema.properties
        }
      }
      if(properties) return makeProperty(key, jsonSchemaProperties2GraphQLQuery(properties, rootSchema, options, level + 1))
    }
    return undefined
  }))
  propertiesList.push('id')
  if(propertiesList.length === 0) return ''
  //prepend tabs at the beginning of each (amount of tabs = level)
  return propertiesList.map(p => p?.split('\n').map(l => `\t${l}`).join('\n')).join('\n')



}
export const jsonSchema2GraphQLQuery = (entityType: string, schema: JSONSchema7, options?: GraphQLMappingOptions ) => {
  const queryName = `get${entityType}`


  const properties = Object.keys(filterForPrimitiveProperties(schema.properties))
      .filter(p => !p.startsWith('@'))
      .filter(key => !options?.propertyBlacklist?.includes(key))
      .join('\n')

  const properties2 = jsonSchemaProperties2GraphQLQuery(schema.properties, schema, options)


  return `query ${queryName}( $pk: ID! ) {
      ${queryName}(pk: $pk) {
      ${properties2}
      }
     
    }
    `

}