import {useQueries, useQuery} from '@tanstack/react-query'
import {RDFMimetype} from 'async-oxigraph'
import {useCallback, useEffect, useState} from 'react'

import {BASE_IRI} from '../config'
import {useOxigraph} from './useOxigraph'

export const useRDFDataSources = (source: string) => {
  const {oxigraph, init, bulkLoaded, setBulkLoaded} = useOxigraph()
  const [bulkLoading, setBulkLoading] = useState(false)
  const {data} = useQuery(['exhibition', 'ontology'], () => fetch(source).then(r => r.text()))

  const load = useCallback(
async (ao: any) => {
  setBulkLoading(true)
  await ao.load(data, RDFMimetype.TURTLE, BASE_IRI)
  setBulkLoading(false)
  setBulkLoaded(true)

}, [setBulkLoading, setBulkLoaded,data])

  useEffect(() => {
    if (!data) return
    if(oxigraph) {
      load(oxigraph.ao)
    } else {
      init()
    }
  }, [init, oxigraph, data])

  return {
    bulkLoading,
    bulkLoaded
  }


}
