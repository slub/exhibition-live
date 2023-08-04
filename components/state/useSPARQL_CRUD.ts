import {NamespaceBuilder} from '@rdfjs/namespace'
import {Bindings, Dataset, DatasetCore, Quad, ResultStream} from '@rdfjs/types'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {ASK, CONSTRUCT, DELETE, INSERT} from '@tpluscode/sparql-builder'
import {JSONSchema7} from 'json-schema'
import jsonld from 'jsonld'
import N3 from 'n3'
import {useCallback, useEffect, useState} from 'react'

import {jsonSchemaGraphInfuser, WalkerOptions} from '../utils/graph/jsonSchemaGraphInfuser'
import {jsonSchema2construct} from '../utils/sparql'

export interface SparqlBuildOptions {
  base?: string;
  prefixes?: Record<string, string | NamespaceBuilder>;
}

export type CRUDFunctions = {
  updateFetch: (query: string) => Promise<ResultStream<any> | boolean | void | ResultStream<Bindings> | ResultStream<Quad>>
  constructFetch: (query: string) => Promise<DatasetCore>
  selectFetch: (query: string) => Promise<any>
  askFetch: (query: string) => Promise<boolean>
}

export type CRUDOptions = CRUDFunctions & {
  defaultPrefix: string
  data: any
  setData: (data: any) => void
  walkerOptions?: Partial<WalkerOptions>
  queryBuildOptions?: SparqlBuildOptions
  upsertByDefault?: boolean
  ready?: boolean,
  refetchInterval?: number | false
}

export const useSPARQL_CRUD = (entityIRI: string | undefined, typeIRI: string | undefined, schema: JSONSchema7,
                               {
                                 askFetch,
                                 constructFetch,
                                 defaultPrefix,
                                 updateFetch,
                                 setData,
                                 data,
                                 walkerOptions = {},
                                 queryBuildOptions,
                                 upsertByDefault,
                                   refetchInterval
                               }: CRUDOptions) => {

  const [isUpdate, setIsUpdate] = useState(false)
  const [whereEntity, setWhereEntity] = useState<string | undefined>()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!entityIRI) return
    const _whereEntity = ` <${entityIRI}> a <${typeIRI}> . `
    setWhereEntity(_whereEntity)
  }, [entityIRI, typeIRI, setWhereEntity])

  const exists = useCallback(async () => {
    if (!whereEntity) return false
    const query = ASK`${whereEntity}`.build(queryBuildOptions)
    try {
      return await askFetch(query)
    } catch (e) {
      console.error(e)
    }
    return false
  }, [whereEntity, setIsUpdate, defaultPrefix, askFetch])

  const load = useCallback(
      async () => {
        if (!entityIRI || !whereEntity) return
        const {
          construct,
          whereRequired,
          whereOptionals
        } = jsonSchema2construct(entityIRI, schema, [], ['@id', '@type'])
        let query = CONSTRUCT`${construct}`.WHERE`
                ${whereEntity}
                ${whereRequired}
                ${whereOptionals}
                `.build(queryBuildOptions)
        query = `PREFIX : <${defaultPrefix}> ` + query
        try {
          const ds = await constructFetch(query)
          const resultJSON = jsonSchemaGraphInfuser(defaultPrefix, entityIRI, ds as Dataset, schema, walkerOptions)
          setIsUpdate(true)
          //setData(resultJSON)
          return resultJSON
        } catch (e) {
          console.error(e)
        }
      },
      [entityIRI, whereEntity, setIsUpdate, defaultPrefix, constructFetch]
  )

  const remove = useCallback(
      async () => {
        if (!entityIRI || !whereEntity) return
        const {
          construct,
          whereRequired,
          whereOptionals
        } = jsonSchema2construct(entityIRI, schema, ['@id'], ['@id', '@type'])
        let query = DELETE` ${construct} `.WHERE`${whereEntity} ${whereRequired}\n${whereOptionals}`.build(queryBuildOptions)
        query = `PREFIX : <${defaultPrefix}> ` + query
        await updateFetch(query)
      },
      [entityIRI, whereEntity, defaultPrefix, updateFetch],
  )


  const save = useCallback(
      async () => {
        if (!data || !entityIRI || !whereEntity) return
        const _data = {
          ...data,
          '@id': entityIRI
        }
        const ntWriter = new N3.Writer({format: 'Turtle'})
        const ds = await jsonld.toRDF(_data)

        // @ts-ignore
        const ntriples = ntWriter.quadsToString([...ds]).replaceAll('_:_:', '_:')

        if (!isUpdate && !upsertByDefault) {
          const updateQuery = INSERT.DATA` ${ntriples} `
          const query = updateQuery.build()
          await updateFetch(query)
          setIsUpdate(true)
        } else {
          const {
            construct,
            whereRequired,
            whereOptionals
          } = jsonSchema2construct(entityIRI, schema, ['@id'], ['@id', '@type'])
          const queries = [
            DELETE` ${construct} `.WHERE`${whereEntity} ${whereRequired}\n${whereOptionals}`.build(queryBuildOptions),
            INSERT.DATA` ${ntriples} `.build(queryBuildOptions)
          ]
          for (let query of queries) {
            query = `PREFIX : <${defaultPrefix}> ` + query
            await updateFetch(query)
          }
          await queryClient.invalidateQueries(['load', entityIRI])
        }
      },
      [entityIRI, whereEntity, data, isUpdate, setIsUpdate, defaultPrefix, updateFetch, upsertByDefault, queryClient])


  const {refetch} = useQuery(['load', entityIRI],
      async () => {
        const res = await load()
        return res || null

      }, {
        onSuccess: (data) => {
          if (data) {
            setData(data)
          }
        },
        enabled: Boolean(entityIRI && whereEntity),
        refetchOnWindowFocus: false,
        refetchInterval

      })


  return {
    exists,
    load: refetch,
    save,
    remove,
    isUpdate,
    setIsUpdate,
    // @ts-ignore
    ready: Boolean(askFetch && constructFetch && updateFetch)
  }
}


