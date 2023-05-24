import {JSONSchema7, JSONSchema7Definition} from 'json-schema'

export const isJSONSchema = (json: JSONSchema7Definition): json is JSONSchema7 => typeof json !== 'boolean'
export const isJSONSchemaDefinition = (json: JSONSchema7Definition | JSONSchema7Definition[] | undefined): json is JSONSchema7Definition =>
    Boolean(json && !Array.isArray(json))

export const removePrimitiveProperties = (properties: JSONSchema7['properties']) => Object.fromEntries(
    Object.entries(properties || {}).filter(([, value]) => typeof value === 'object' && (value.type !== 'string' && value.type !== 'number' && value.type !== 'boolean')))

export const filterForPrimitiveProperties = (properties: JSONSchema7['properties']) => Object.fromEntries(
    Object.entries(properties || {}).filter(([, value]) => typeof value === 'object' && (value.type === 'string' || value.type === 'number' || value.type === 'boolean')))
