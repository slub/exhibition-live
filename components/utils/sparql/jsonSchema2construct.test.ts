import {describe, expect, test} from '@jest/globals'
import {JSONSchema6} from 'json-schema'

import {buildConstructQuery} from './jsonSchema2construct'

const schema: JSONSchema6 = {
'$schema': 'http://json-schema.org/draft-06/schema#',
    '$id': 'https://example.com/person.schema.json',
    'title': 'Person',
    'description': 'A human being',
    'type': 'object',
    'required': [ 'name', 'father' ],
    'properties': {
      'name': {
          'type': 'string'
      },
      'knows': {
        'type': 'array',
        'items': {
          'required': [ 'nick' ],
          'properties': {
            'nick': { 'type': 'string' },
          }
        }
      },
      'father': {
        'type': 'object',
        'properties': {
          'name': { 'type': 'string' },
          'description': { 'type': 'string'}
        }
      }
    }
}

describe('make construct query', () => {

  test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3)
  })

  test('can build construct query from simple schema', () => {
    const constructQuery = buildConstructQuery('http://www.example.com/test', schema)
    console.log(constructQuery)
    expect(constructQuery).toMatch(/CONSTRUCT {.*/ )
  })

})
