import {NamespaceBuilder} from '@rdfjs/namespace'
import {Bindings, DatasetCore, Quad, ResultStream} from '@rdfjs/types'

import {WalkerOptions} from '../utils/graph/jsonSchemaGraphInfuser'

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
  ready?: boolean
}
