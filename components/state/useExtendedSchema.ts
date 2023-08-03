import {useQuery} from '@tanstack/react-query'

import genSlubJSONLDSemanticProperties from '../form/genSlubJSONLDSemanticProperties'
import {prepareStubbedSchema} from './stubHelper'

type UseExtendedSchemaProps = {
  typeName: string
  classIRI: string
}

const useExtendedSchema = ({typeName, classIRI}: UseExtendedSchemaProps) => {
  const {data: loadedSchema} = useQuery(['schema', typeName], () => fetch(`./schema/${typeName}.schema.json`).then(async res => {
    const jsonData: any = await res.json()
    if (!jsonData) return
    const prepared = prepareStubbedSchema(jsonData, genSlubJSONLDSemanticProperties, {
      exclude: [
          'involvedperson',
          'involvedcorporation',
        'involvedPersons',
        'involvedCorporations'
      ]
    } )
    const defsFieldName = prepared.definitions ? 'definitions' : '$defs'
    const specificModel = prepared[defsFieldName]?.[typeName] as (object | undefined) || {}
    const finalSchema = {
      ...(typeof prepared === 'object' ? prepared : {}),
      ...specificModel
    }
    return finalSchema
  }))

  return loadedSchema
}

export default useExtendedSchema