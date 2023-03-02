import {JsonSchema, resolveSchema} from '@jsonforms/core'
import ds from '@rdfjs/data-model'
import namespace from '@rdfjs/namespace'
import {Dataset} from '@rdfjs/types'
import {rdf} from '@tpluscode/rdf-ns-builders'
import clownface from 'clownface'
import {JSONSchema7, JSONSchema7Definition} from 'json-schema'

import {filterUndefOrNull} from '../core'
import {isJSONSchema, isJSONSchemaDefinition} from '../core/jsonSchema'



export type WalkerOptions = {
  omitEmptyArrays: boolean
  omitEmptyObjects: boolean
  maxRecursionEachRef: number
  maxRecursion: number
}

type CircularCounter = {
  [ref: string]: number
}

const propertyWalker = (baseIRI: string, node: clownface.GraphPointer, subSchema: JSONSchema7 , rootSchema: JSONSchema7, level: number, circularSet: CircularCounter, options: Partial<WalkerOptions>) => {
  const base = namespace(baseIRI)
  const MAX_RECURSION = options?.maxRecursionEachRef || 5
  if (options?.maxRecursion && level > options?.maxRecursion) {
    console.warn(`will stop at level ${level} to prevent infinite loop because MAX_RECURSION is set to ${options.maxRecursion}`)
    return
  }
  const entries = Object.entries(subSchema.properties || {}).map(([property, schema]) => {
    let val: any
    const newNode = node.out(base[property])
    if (isJSONSchema(schema)) {
      if (schema.$ref) {
        const ref = schema.$ref
        const subSchema =  resolveSchema(schema as JsonSchema, '', rootSchema as JsonSchema)
        if (subSchema && isJSONSchemaDefinition(subSchema as JSONSchema7Definition) && isJSONSchema(subSchema as JSONSchema7)) {
          if (!circularSet[ref] || circularSet[ref] < MAX_RECURSION) {
            val = propertyWalker(
                baseIRI,
                newNode as clownface.GraphPointer,
                subSchema as JSONSchema7,
                rootSchema,
                level + 1,
                {...circularSet, [ref]: (circularSet[ref] || 0) + 1},
                options)
          }
        }
      }
      else if (schema.properties) {
        val = propertyWalker(
            baseIRI,
            newNode as clownface.GraphPointer,
            schema,
            rootSchema,
            +1,
            circularSet,
            options)
      }
      else if (schema.items) {
        val = filterUndefOrNull(newNode.map(quad => {
          if (isJSONSchemaDefinition(schema.items) && isJSONSchema(schema.items)) {
            if (schema.items.$ref) {
              const ref = schema.items.$ref
              const subSchema =  resolveSchema(schema.items as JsonSchema, '', rootSchema as JsonSchema)
              if (subSchema && isJSONSchemaDefinition(subSchema as JSONSchema7Definition) && isJSONSchema(subSchema as JSONSchema7)) {
                if ((circularSet[ref] || 0) < MAX_RECURSION) {
                  return propertyWalker(
                      baseIRI,
                      quad,
                      subSchema as JSONSchema7,
                      rootSchema,
                      level + 1,
                      {...circularSet, [ref]: (circularSet[ref] || 0) + 1},
                      options)
                }
                return
              }
            } else if (schema.items.properties) {
              return propertyWalker(baseIRI, quad, schema.items, rootSchema, level + 1, circularSet, options)
            }
            if(schema.items.type) {
              if(!Array.isArray(schema.items.type)) {
                switch (schema.items.type) {
                  case 'object':
                    return {}
                  case 'array':
                    return []
                  case 'integer':
                    return (parseInt(quad.value))
                  case 'number':
                    return (parseFloat(quad.value))
                  case 'boolean':
                    return quad.value === 'true'
                  case 'string':
                    return quad.value
                  default:
                    return quad.value
                }
              }
            }
          }
        }))
      }
      else if (schema.type === 'array') {
        val = newNode.values
      }
      if (!val) {
        if (!Array.isArray(schema.type)) {
          switch (schema.type) {
            case 'object':
              val = {}
              break
            case 'array':
              val = []
              break
            default:
              val = newNode.values[0]
          }
        }
      }
    }
    return [property, val]
  }).filter(([_, val]) => !(val === undefined)
      && !(val === null)
      && !(options?.omitEmptyArrays && Array.isArray(val) && (val as any[]).length === 0)
      && !(options?.omitEmptyObjects && typeof val === 'object' && Object.keys(val).length === 0)
  )

  let additionalProps = {}
  if (rootSchema.type === 'object') {
    if (node.term?.termType === 'NamedNode') {
      additionalProps = {
        ...additionalProps,
        '@id': node.term.value
      }
    }
    const typeNode = node.out(rdf.type)
    if(typeNode.value) {
      additionalProps = {
        ...additionalProps,
        '@type': typeNode.value
      }
    }
  }
  return {
    ...additionalProps,
    ...Object.fromEntries(entries)
  }
}
export const jsonSchemaGraphInfuser = (baseIRI: string, iri: string, dataset: Dataset , rootSchema: JSONSchema7, options: Partial<WalkerOptions>) => {
  const tbbt = clownface({dataset})
  const startNode: clownface.GraphPointer = tbbt.node(ds.namedNode(iri))
  return propertyWalker(baseIRI, startNode, rootSchema, rootSchema, 0, {}, options || {})
}
