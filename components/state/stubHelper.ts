import {GenJSONLDSemanticPropertiesFunction} from '@graviola/crud-jsonforms'
import {JSONSchema7, JSONSchema7Definition} from 'json-schema'
import isObject from 'lodash/isObject'


const filterForPrimitiveProperties = (properties: JSONSchema7['properties']) => Object.fromEntries(
    Object.entries(properties || {}).filter(([, value]) => typeof value === 'object' && (value.type === 'string' || value.type === 'number' || value.type === 'integer' || value.oneOf||  value.type === 'boolean')))
export const defs: (schema: JSONSchema7) => NonNullable<JSONSchema7['definitions']> = (schema: JSONSchema7) => schema.$defs || schema.definitions || {}

type RefAppendOptions = {
  exclude?: string[]
}

export const recursivelyFindRefsAndAppendStub: (field: string, schema: JSONSchema7, rootSchema?: JSONSchema7, options?: RefAppendOptions) => JSONSchema7 = (field, schema: JSONSchema7, rootSchema = schema, options ) => {
  const exclude  = options?.exclude || []
  //console.log({options})
  //console.log({'field': field, exclude})
  if(exclude.includes(field)) {
    console.log(field)
    return schema
  }
  const definitionsKey = '$defs' in rootSchema ? '$defs' : 'definitions'
  if (schema.$ref) {
    return {
      ...schema,
      $ref: `${schema.$ref}Stub`
    }
  }
  if (isObject(schema.items)) {
    return {
      ...schema,
      items: recursivelyFindRefsAndAppendStub(field, schema.items as JSONSchema7, rootSchema, options)
    }
  }
  if (schema.properties) {
    return {
      ...schema,
      properties: Object.fromEntries(Object.entries(schema.properties).map(([k, s]) => [k, recursivelyFindRefsAndAppendStub(k, s as JSONSchema7, rootSchema)] as [string, JSONSchema7Definition], options))
    }
  }
  if (defs(schema)) {
    return {
      ...schema,
      [definitionsKey]: Object.fromEntries(Object.entries(defs(schema)).map(([k, s]) => [k, recursivelyFindRefsAndAppendStub(k, s as JSONSchema7, rootSchema)] as [string, JSONSchema7Definition], options))
    }
  }
  return schema
}

export const definitionsToStubDefinitions = (definitions: JSONSchema7['definitions']) =>
    (Object.entries(definitions || {}).reduce((acc, [key, value]) => {
      const stubKey = `${key}Stub`
      const stub = {
        ...(isObject(value) ? value : {}),
        properties: isObject(value) ? filterForPrimitiveProperties(value.properties) : undefined
      }
      return {
        ...acc,
        [stubKey]: stub
      }
    }, {}) as JSONSchema7['definitions'])


export const prepareStubbedSchema = (schema: JSONSchema7, genJSONLDSemanticProperties?: GenJSONLDSemanticPropertiesFunction, options?: RefAppendOptions) => {
  const definitionsKey = '$defs' in schema ? '$defs' : 'definitions'

  const withJSONLDProperties: (name: string, schema: JSONSchema7) => JSONSchema7 = (name: string, schema: JSONSchema7) => ({
    ...schema,
    properties: {
      ...schema.properties,
      ...(genJSONLDSemanticProperties ? genJSONLDSemanticProperties(name) : {})
    }
  }) as JSONSchema7

  const stubDefinitions = definitionsToStubDefinitions(defs(schema))
  //console.log({options})
  const schemaWithRefStub = recursivelyFindRefsAndAppendStub('root', schema, schema, options)

  const stubbedSchema = {
    ...schemaWithRefStub,
    [definitionsKey]: {
      ...stubDefinitions,
      ...schemaWithRefStub[definitionsKey]
    }
  }

  const definitionsWithJSONLDProperties = Object.entries(defs(stubbedSchema)).reduce<JSONSchema7['definitions']>((acc, [key, value]) => {
    return {
      ...acc,
      [key]: withJSONLDProperties(key, value as JSONSchema7)
    }
  }, {}) as JSONSchema7['definitions']

  const stubbedSemanticSchema: JSONSchema7 = {
    ...stubbedSchema,
    [definitionsKey]: definitionsWithJSONLDProperties
  }


  return stubbedSemanticSchema
}
