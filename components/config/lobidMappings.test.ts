import {describe, expect, test} from '@jest/globals'
import {randomUUID} from 'crypto'

import exampleData from '../../fixtures/lobid/documeta-1257120557.json'
import {mapGNDToModel2} from '../utils/gnd/mapGNDToModel'
import {exhibitionDeclarativeMapping} from './lobidMappings'




const strategyContext: StrategyContext = {
  getPrimaryIRIBySecondaryIRI: async (secondaryIRI: string, authorityIRI: string, typeIRI: string) => {
    console.warn('using stub method')
    return null//'http://example.com/1231231'
  },
  authorityIRI: 'http://d-nb.info/gnd',
  newIRI: (typeIRI: string) => {
    console.warn('using stub method')
    return `http://example.com/${randomUUID()}`
  }
}
describe('can apply different mapping strategies', () => {

  test('can use simple mapping', () => {
    const mappedData = mapGNDToModel2(exampleData, {'@id': 'http://example.com/testcase'}, exhibitionDeclarativeMapping, strategyContext)
    mappedData.then(data => {
      expect(data).toStrictEqual({
        '@id': 'http://example.com/testcase',
        title: 'Documenta (15. : 2022 : Kassel)',
        location: {'@id': 'http://example.com/1231231'}
      })
    })

  })
})
