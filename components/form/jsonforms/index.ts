import {JsonSchema, UISchemaElement} from '@jsonforms/core'

export const jsonSchema2UISchemaElements: (jsonschema: JsonSchema, subpath?: string) => UISchemaElement[] = (jsonschema: JsonSchema, subpath) => {
  const uiSchemaElements: UISchemaElement[] = Object.keys(jsonschema.properties || {})
      .map(k => ({ type: 'Control', scope: `#/properties/${subpath  || ''}${k}`}))
  return uiSchemaElements
}
