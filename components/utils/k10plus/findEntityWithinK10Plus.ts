import {XMLParser} from 'fast-xml-parser'

import {SearchRetrieveResponseTypes} from './searchRetrieveResponse-types'


export const findEntityWithinK10Plus = async (searchString: string, typeName: string, limit?: number):Promise<SearchRetrieveResponseTypes> => {
  let rawResponse
  try {
     rawResponse = await fetch(`http://sru.bsz-bw.de/swbtest?version=1.1&query=pica.all%3D${encodeURIComponent(searchString)}&operation=searchRetrieve&maximumRecords=${limit}&recordSchema=marcxmlk10os`,
         {
            headers: {
              'Accept': 'application/xml',
              'Access-Control-Allow-Origin': '*',
            },
         })
  } catch (e) {
    console.error('Error fetching from K10Plus', e)
    return
  }
  const res = await rawResponse.text()
  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true
  })
  const jObj = parser.parse(res)
  return jObj as SearchRetrieveResponseTypes
}
