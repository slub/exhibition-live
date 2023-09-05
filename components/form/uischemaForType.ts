import {UISchemaElement} from '@jsonforms/core'
import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'

import {BASE_IRI} from '../config'
import ExhibitionUISchema from './uischema/Exhibition.uischema.json'
import ExhibitionExponatUISchema from './uischema/ExhibitionExponat.uischema.json'
import InvolvedPersonUISchema from './uischema/InvolvedPerson.uischema.json'
import LocationUISchema from './uischema/Location.uischema.json'
import PersonUISchema from './uischema/Person.uischema.json'
import PlaceUISchema from './uischema/Place.uischema.json'


const uischemata = {
  'Exhibition': ExhibitionUISchema,
  'ExhibitionExponat': ExhibitionExponatUISchema,
  'InvolvedPerson': InvolvedPersonUISchema,
  'Location': LocationUISchema,
  'Person': PersonUISchema,
  'Place': PlaceUISchema
}
export const useUISchemaForType = (typeIRI: string, enableLoadFromExternal?: boolean) => {
  const typeName = useMemo(() => typeIRI.substring(BASE_IRI.length, typeIRI.length), [typeIRI])
  const uischemaFixed = uischemata[typeName] as UISchemaElement  | undefined
  const {data: uiSchemaFromServer} = useQuery(['uischema', typeIRI], async () => {
    const url = `./uischema/${typeName}.uischema.json`
    const exists = await fetch(url, {method: 'HEAD'}).then(res => res.ok)
    if (exists) {
      return await fetch(url)
          .then(async res => await res.json())
          .catch(() => null)
    }
    return null
  }, {
    enabled: Boolean(enableLoadFromExternal),
    retry: false,
    refetchOnWindowFocus: false,
    retryOnMount: false,
    onError: (err) => {}
  })
  return useMemo<UISchemaElement | null>(() => uiSchemaFromServer || uischemaFixed || null, [uiSchemaFromServer, uischemaFixed])
}
