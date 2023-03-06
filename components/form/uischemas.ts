import {JsonFormsUISchemaRegistryEntry} from '@jsonforms/core'

import {BASE_IRI} from '../config'


const createStubLayout = (defs: string, baseIRI: string, label?: string) => ({
  'type': 'VerticalLayout',
  'elements': [
    {
      'type': 'Control',
      'label': label || defs,
      'options': {
        'inline': true,
        'context': {
          '$ref': `#/$defs/${defs}`,
          'typeIRI': `${baseIRI}${defs}`,
          'useModal': false
        }
      },
      'scope': '#/properties/@id'
    },
    {
      'type': 'Control',
      'scope': '#/properties/@type'
    }
  ]
})

const createUiSchema: (key: string, baseIRI: string, label?: string) => JsonFormsUISchemaRegistryEntry = (key, baseIRI,label) => ({
    tester: (schema) => {
        return schema.properties?.['@type']?.const === `${baseIRI}${key}` ? 11 : -1
    },
    uischema: createStubLayout(key, baseIRI, label)

})
export const uischemas: JsonFormsUISchemaRegistryEntry[] = ['Person', 'Work', 'Organization', 'Location'].map((key) => createUiSchema(key, BASE_IRI))
