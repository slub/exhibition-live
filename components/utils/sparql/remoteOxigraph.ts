import {QueryEngine} from '@comunica/query-sparql'
import {IDataSource} from '@comunica/types'
import datasetFactory from '@rdfjs/dataset'
import N3 from 'n3'

import {CRUDFunctions} from '../../state/useSPARQL_CRUD'

const cFetch = (query: string, endpoint: string) => fetch(endpoint, {
    'headers': {
        'accept': 'application/n-triples,*/*;q=0.9',
        'content-type': 'application/x-www-form-urlencoded',
    },
    'body': `query=${encodeURIComponent(query)}`,
    'method': 'POST',
    'mode': 'cors',
    'credentials': 'omit',
    'cache': 'no-cache'
})
const askFetch = (query: string, endpoint: string) => fetch(endpoint, {
    'headers': {
        'accept': 'application/sparql-results+json,*/*;q=0.9',
        'content-type': 'application/x-www-form-urlencoded',
    },
    'body': `query=${encodeURIComponent(query)}`,
    'method': 'POST',
    'mode': 'cors',
    'credentials': 'omit',
    'cache': 'no-cache'
})

const createCutomizedFetch: (query: string, accept?: string,contentType?: string) => (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> = (query,accept,  contentType = 'application/sparql-query') => async (input, init) => {
    const headers = new Headers(init?.headers)
    accept &&  headers.set('accept', accept)
    contentType &&  headers.set('Content-Type', contentType)
    const newInit = {
        ...(typeof init === 'object' ? init : {}),
        headers,
        body: query,
        method: 'POST',
        catch: 'no-cache'
    }
    return await fetch(input, newInit)
}
const defaultQueryFetch = (endpoint:string, accept?: string, contentType?: string) => async (query: string) => {
    const engine = new QueryEngine()
    const prepared = await engine.query(query, {
        sources: [endpoint] as [IDataSource],
        fetch: createCutomizedFetch(query,accept || 'application/sparql-results+json', contentType  )
    })
    return await prepared.execute()
}
export const defaultQuerySelect: (query: string, endpoint: string) => Promise<any[]> = async (query: string, endpoint) => {
    const sFetch = createCutomizedFetch(query)
    const prepared = await sFetch(endpoint)
    return ((await prepared.json())?.results?.bindings || []) as any[]
}

export const oxigraphCrudOptions: (endpoint: string) => CRUDFunctions = (endpoint: string) => ({
    askFetch: async (query: string) => {
        const res = await askFetch(query, endpoint)
        const {boolean} = await res.json()
        return boolean === true
    },
    constructFetch: async (query: string) => {
        const res = await cFetch(query, endpoint),
            reader = new N3.Parser(),
            ntriples = await res.text(),
            ds = datasetFactory.dataset(reader.parse(ntriples))
        return ds

    },
    updateFetch: defaultQueryFetch(endpoint.replace('query', 'update'), undefined, 'application/sparql-update'),
    selectFetch:  async (query: string) => {
        const res = await askFetch(query, endpoint)
        const resultJson = await res.json()
        return resultJson?.results?.bindings || []
    },
})
