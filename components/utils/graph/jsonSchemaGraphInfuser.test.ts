import {describe, expect, test} from '@jest/globals'
import datasetFactory from '@rdfjs/dataset'
import N3Parser from '@rdfjs/parser-n3'
import {Dataset} from '@rdfjs/types'
import fs from 'fs'
import {JSONSchema7} from 'json-schema'
import path, { dirname } from 'path'
import dsExt from 'rdf-dataset-ext'
import { fileURLToPath } from 'url'

import {jsonSchemaGraphInfuser} from './jsonSchemaGraphInfuser'

const __dirname = dirname(fileURLToPath(import.meta.url))

function sampleDataset () {
  //const filename = path.join(path.dirname(require.resolve('tbbt-ld')), 'dist/tbbt.nq')
  const filename = path.join(__dirname, '../../../node_modules/tbbt-ld', 'dist/tbbt.nq')
  console.log(filename)
  const input = fs.createReadStream(filename)
  const parser = new N3Parser()

  return dsExt.fromStream(datasetFactory.dataset(), parser.import(input))
}

const schemaStub = {
  '$defs': {
    'Address': {
      'type': 'object',
      'properties': {
        'addressCountry': {
          'type': 'string'
        },
        'addressRegion': {
          'type': 'string'
        },
        'postalCode': {
          'type': 'string'
        },
        'streetAddress': {
          'type': 'string'
        },
      }
    },
    'Person': {
      'title': 'Person',
      'description': 'A human being',
      'type': 'object',
      'properties': {
        'familyName': {
          'type': 'string'
        },
        'givenName': {
          'type': 'string'
        },
        'knows': {
          'type': 'array',
          'items': {
            '$ref': '#/$defs/Person'
          }
        },
        'address': {
          '$ref': '#/$defs/Address'
        }
      }
    }
  },
  '$schema': 'http://json-schema.org/draft-06/schema#',
  '$id': 'https://example.com/person.schema.json',
}

describe('can get data via json schema', () => {
  test('build from clownface', () => {
    expect(sampleDataset()).toBeDefined()
  })

  const baseIRI = 'http://schema.org/'
  test('get from test schema', async () =>{
    const schema = {...schemaStub, ...schemaStub.$defs.Person}
    const ds = await sampleDataset()
    const data = jsonSchemaGraphInfuser(baseIRI, 'http://localhost:8080/data/person/leonard-hofstadter', ds as Dataset, schema as JSONSchema7, {
          omitEmptyArrays: true,
          omitEmptyObjects: true,
          maxRecursionEachRef: 1,
          maxRecursion: 5
        })
    //console.log(JSON.stringify(data, null, 2))
    expect(data).toStrictEqual(
        {
          'familyName': 'Hofstadter',
          'givenName': 'Leonard',
          'knows': [
            {
              'familyName': 'Fowler',
              'givenName': 'Amy',
              'knows': []
            },
            {
              'familyName': 'Rostenkowski-Wolowitz',
              'givenName': 'Bernadette',
              'knows': []
            },
            {
              'familyName': 'Wolowitz',
              'givenName': 'Howard',
              'knows': []
            },
            {
              'givenName': 'Penny',
              'knows': []
            },
            {
              'familyName': 'Koothrappali',
              'givenName': 'Rajesh',
              'knows': []
            },
            {
              'familyName': 'Cooper',
              'givenName': 'Sheldon',
              'knows': []
            },
            {
              'familyName': 'Bloom',
              'givenName': 'Stuart',
              'knows': []
            },
            {
              'familyName': 'Cooper',
              'givenName': 'Mary',
              'knows': []
            }
          ]
        }

    )
  })
})
