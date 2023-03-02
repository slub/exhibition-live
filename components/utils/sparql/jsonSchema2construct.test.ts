import {describe, expect, test} from '@jest/globals'
import {CONSTRUCT} from '@tpluscode/sparql-builder'
import {JSONSchema7} from 'json-schema'

import {BASE_IRI} from '../../config'
import {exhibitionPrefixes} from '../../exhibtion'
import {jsonSchema2construct} from './jsonSchema2construct'

const schema: JSONSchema7 = {
    '$schema': 'http://json-schema.org/draft-07/schema#',
    '$id': 'https://example.com/person.schema.json',
    'title': 'Person',
    'description': 'A human being',
    'type': 'object',
    'required': ['name', 'father'],
    'properties': {
        'name': {
            'type': 'string'
        },
        'knows': {
            'type': 'array',
            'items': {
                'required': ['nick'],
                'properties': {
                    'nick': {'type': 'string'},
                }
            }
        },
        'father': {
            'type': 'object',
            'properties': {
                'name': {'type': 'string'},
                'description': {'type': 'string'}
            }
        }
    }
}

const schema2: JSONSchema7 = {
    '$schema': 'http://json-schema.org/draft-07/schema#',
    '$id': 'https://example.com/person.schema.json',
    'title': 'Person',
    'description': 'A human being',
    'type': 'object',
    'required': ['name', 'father'],
    'properties': {
        'name': {
            'type': 'string'
        },
        'knows': {
            'type': 'array',
            'items': {
                'required': ['nick'],
                'properties': {
                    'nick': {'type': 'string'},
                }
            }
        },
        'father': {
            'type': 'object',
            'properties': {
                '@id': {'type': 'string'},
                'name': {'type': 'string'},
                'description': {'type': 'string'}
            }
        }
    }
}
const subject = 'http://www.example.com/test'
const buildConstructQuery = (subjectURI: string,schema: JSONSchema7) => {
    const {
        construct, whereRequired, whereOptionals
    } = jsonSchema2construct(subjectURI, schema)
    return CONSTRUCT`${construct}`.WHERE`${whereRequired}\n${whereOptionals}`
}
describe('make construct query', () => {

    test('can build construct query from simple schema', () => {
        const constructQuery = buildConstructQuery(subject, schema).build({
            base: BASE_IRI,
            prefixes: {
                ...exhibitionPrefixes
            }
        }).toString()
        console.log(constructQuery)
        expect(constructQuery).toMatch(/CONSTRUCT {.*/)
    })

    test('use stop symbols', () => {
        const {construct, whereOptionals} = jsonSchema2construct(subject, schema2, ['@id'])
        console.log(whereOptionals)
        expect(whereOptionals).toMatch(subject)
    })

})
