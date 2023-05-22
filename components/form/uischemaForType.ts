import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'

import {BASE_IRI} from '../config'

export const useUISchemaForType = (typeIRI: string) => {
  const typeName = useMemo(() => typeIRI.substring(BASE_IRI.length, typeIRI.length), [typeIRI])
  const {data} = useQuery(['uischema', typeIRI], () => fetch(`./uischema/${typeName}.uischema.json`).then(async res => {
    let schema = null
    try {
       schema = await res.json()
    } catch (e) {
      console.log(`No uischema found for ${typeName}``)
    }
    return schema
  }), {
    retry: false,
    onError: (err) => {}
  })
  return data
}
