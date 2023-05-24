import {useQuery} from '@tanstack/react-query'
import {JSONSchema7} from 'json-schema'
import {useCallback, useEffect, useMemo, useState} from 'react'

import {BASE_IRI} from '../config'
import {slent} from '../form/formConfigs'
import {useFetchData} from '../graphql/useFetchData'
import {jsonSchema2GraphQLQuery} from '../utils/graphql/jsonSchema2GraphQLQuery'
import {CRUDOptions} from './types'

/**
 * recursively go through the data and add @id for objects that have an id field
 * @param data
 * @param idFieldKeys the keys that are used to identify the id field
 */
const makeIRIsFromIDs: (data: any, idFieldKeys?: string[]) => any = (data, idFieldKeys = ['id', 'uuid']) => {
  if(!data) return data
  if(Array.isArray(data)) {
    return data.map(d => makeIRIsFromIDs(d, idFieldKeys))
  }
  if(typeof data === 'object') {
    const keys = Object.keys(data)
    const idFieldKey = keys.find(k => idFieldKeys.includes(k))
    const newData: any = Object.fromEntries(keys.map(k => [k, makeIRIsFromIDs(data[k], idFieldKeys)]))
    if(idFieldKey) {
      return {
        ...newData,
        '@id': slent(data[idFieldKey]).value
      }
    } else {
      return newData
    }
  }
  return data
}

export const useGraphQL_CRUD = (entityIRI: string | undefined, typeIRI: string | undefined, schema: JSONSchema7,
                                {
                                  askFetch,
                                  constructFetch,
                                  defaultPrefix,
                                  updateFetch,
                                  setData,
                                  data,
                                  upsertByDefault
                                }: CRUDOptions) => {

  const [isUpdate, setIsUpdate] = useState(false)

  const typeName = useMemo(() => typeIRI ? typeIRI.substring(BASE_IRI.length, typeIRI.length) : '', [typeIRI])
  const id = useMemo(() => typeof entityIRI === 'string' ? entityIRI.substring(entityIRI.lastIndexOf('#') + 1, entityIRI.length) : undefined, [entityIRI])
  const gqlQuery = useMemo<string | undefined>(() => {
    if (!typeIRI) return
    return jsonSchema2GraphQLQuery(typeName, schema)
  }, [typeName, schema])
  const {
      refetch,
    data: gqlData
  } = useQuery([typeIRI, entityIRI], useFetchData(gqlQuery || '').bind(null, {pk: id}), {
    enabled: !!(gqlQuery && id)
  })

  useEffect(() => {
    const resp = (gqlData as any)?.[`get${typeName}`]
    if(!resp) return
    const jsonldMixin = {
      '@type': typeIRI,
      '@context': {
        '@vocab': BASE_IRI
      }
    }
    const _data = makeIRIsFromIDs(
        Object.fromEntries(Object.entries(resp).filter(([,v]) => v !== undefined && v !== null)))
    setData({
      ..._data,
      ...jsonldMixin
    })
  }, [setData, gqlData, typeName, id, typeIRI])


  const exists = useCallback(async () => {
    if (!id) return false
    const resp = (gqlData as any)?.[`get${typeName}`]
    if(resp?.id === id)
      return true
    return false
  }, [id, gqlData, typeName])

  const load = useCallback(
      async () => {
        if (!entityIRI) return
        refetch()
        setIsUpdate(true)
      },
      [entityIRI, typeIRI, refetch, setIsUpdate]
  )

  const remove = useCallback(
      async () => {
        if (!entityIRI) return
        console.warn('not implemented yet')
      },
      [entityIRI, defaultPrefix, updateFetch],
  )


  const save = useCallback(
      async () => {
        if (!data || !entityIRI) return
        console.warn('not implemented yet')
      },
      [entityIRI, data, isUpdate, setIsUpdate, defaultPrefix, updateFetch, upsertByDefault])

  return {
    exists,
    load,
    save,
    remove,
    isUpdate,
    setIsUpdate,
    // @ts-ignore
    ready: Boolean(askFetch && constructFetch && updateFetch)
  }
}


