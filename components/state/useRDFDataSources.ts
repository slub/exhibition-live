import {RDFMimetype} from 'async-oxigraph'
import {useEffect, useState} from 'react'

import {BASE_IRI} from '../config'
import {useOxigraph} from './useOxigraph'

export const useRDFDataSources = (sources: string[]) => {
  const {init, bulkLoaded, setBulkLoaded} = useOxigraph()
  const [bulkLoading, setBulkLoading] = useState(false)

  useEffect(() => {
    init().then(ao => {
          setBulkLoading(true)
          Promise.all(
              sources.map(source => fetch(source)
                  .then(r => r.text())
                  .then(exhibitionData => ao.load(exhibitionData, RDFMimetype.TURTLE, BASE_IRI))
              )
          )
              .then(() => {
                console.log('successfullt bulk loaded data')
              })
              .catch(e => {
                console.error('some error occurred while bulk loading',e )
              })
              .finally(() =>{
            setBulkLoading(false)
            setBulkLoaded(true)
          })})}, [init, setBulkLoading, setBulkLoaded])

  return {
    bulkLoading,
    bulkLoaded
  }


}
