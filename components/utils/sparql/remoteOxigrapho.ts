import {QueryEngine} from '@comunica/query-sparql'
import {BindingsStream, IDataSource} from '@comunica/types'
import datasetFactory from '@rdfjs/dataset'
import {Bindings, ResultStream} from '@rdfjs/types'
import N3 from 'n3'

type Sources = [IDataSource, ...IDataSource[]]
const sources: Sources = ['http://localhost:7878/query'] // ['http://localhost:9999/blazegraph/namespace/kb/sparql']
const sourcesUpdate: Sources = ['http://localhost:7878/update'] // ['http://localhost:9999/blazegraph/namespace/kb/sparql']
const cFetch = (query: string) => fetch('http://localhost:7878/query', {
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
const askFetch = (query: string) => fetch('http://localhost:7878/query', {
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

const createCutomizedFetch: (query: string, contentType?: string) => (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> = (query, contentType = 'application/sparql-query') => async (input, init) => {
    const headers = new Headers(init?.headers)
    headers.set('Content-Type', contentType)
    const newInit = {
        ...(typeof init === 'object' ? init : {}),
        headers,
        body: query,
        method: 'POST',
        catch: 'no-cache'
    }
    return await fetch(input, newInit)
}
const defaultQueryFetch = async (query: string) => {
    const engine = new QueryEngine()
    const prepared = await engine.query(query, {
        sources: sourcesUpdate,
        fetch: createCutomizedFetch(query, 'application/sparql-update')
    })
    return await prepared.execute()
}
export const defaultQuerySelect: (query: string) => Promise<any[]> = async (query: string) => {
    const sFetch = createCutomizedFetch(query)
    const prepared = await sFetch(sources[0] as string)
    return ((await prepared.json())?.results?.bindings || []) as any[]
}

export const oxigrahCrudOptions = {
    askFetch: async (query: string) => {
        const res = await askFetch(query)
        const {boolean} = await res.json()
        return boolean === true
    },
    constructFetch: async (query: string) => {
        const res = await cFetch(query),
            reader = new N3.Parser(),
            ntriples = await res.text(),
            ds = datasetFactory.dataset(reader.parse(ntriples))
        return ds

    },
    updateFetch: defaultQueryFetch
}
