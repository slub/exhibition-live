import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'

import {BASE_IRI} from '../config'

export const useUISchemaForType = (typeIRI: string) => {
  const typeName = useMemo(() => typeIRI.substring(BASE_IRI.length, typeIRI.length), [typeIRI])
  const {data} = useQuery(['uischema', typeIRI], () => fetch(`./uischema/${typeName}.uischema.json`).then(async res => {
    const schema = await res.json()
    return schema
  }).catch(() => {
    //probably not found, silently fail
    return null
  }), {
    retry: false,
    onError: (err) => {}
  })
  return data
}
