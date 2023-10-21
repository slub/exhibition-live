import datasetFactory from '@rdfjs/dataset'
import {WorkerResult} from 'async-oxigraph'
import N3 from 'n3'
import {useCallback, useEffect, useState} from 'react'

import {oxigraphCrudOptions} from '../utils/sparql/remoteOxigraph'
import {useSettings} from './useLocalSettings'
import {useOxigraph} from './useOxigraph'
import {CRUDFunctions} from './useSPARQL_CRUD'

type UseGlobalCRUDOptions = () => {
  crudOptions? : CRUDFunctions
  doLocalQuery: (query: string, mimeType?: string) => Promise<WorkerResult>
}


export const useGlobalCRUDOptions: UseGlobalCRUDOptions = () => {
  const {activeEndpoint} = useSettings()
  const [localWorkerCRUDOptions, setLocalWorkerCRUDOptions] = useState<CRUDFunctions | undefined>()
  const [crudOptions, setCrudOptions] = useState<CRUDFunctions | undefined>()
  const {oxigraph, init} = useOxigraph()
  const doQuery = useCallback(async (query: string, mimeType?: string) => {
    if (!oxigraph) {
      await init()
      throw new Error('Oxigraph not initialized')
    }
    return await oxigraph.ao.query(query)
  }, [oxigraph])

  useEffect(() => {
     setCrudOptions(activeEndpoint && (activeEndpoint.endpoint === 'urn:worker'
         ? localWorkerCRUDOptions
         : oxigraphCrudOptions(activeEndpoint.endpoint)))
  },[localWorkerCRUDOptions, activeEndpoint?.endpoint, setCrudOptions])

  useEffect(() => {
    const localWorkerCRUD: CRUDFunctions = {
      askFetch: async (query) => Boolean(await doQuery(query)),
      // @ts-ignore
      constructFetch: async (query) => {
        const result = await  doQuery(query, 'application/turtle')
        console.log({result})
        if(!result?.data) return
        const reader = new N3.Parser()
        return await datasetFactory.dataset(reader.parse(result.data))
      },
      // @ts-ignore
      updateFetch: (query) => doQuery(query),
      selectFetch: async (query) => {
        const result = await doQuery(query)
        return result?.data?.results?.bindings
      }
    }
    setLocalWorkerCRUDOptions(localWorkerCRUD)
  }, [doQuery, setLocalWorkerCRUDOptions])

  return {
    crudOptions,
    doLocalQuery: doQuery
  }

}
