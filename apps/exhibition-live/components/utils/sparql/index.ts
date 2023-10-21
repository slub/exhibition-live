import {Prefixes} from '../types'

export const prefixes2sparqlPrefixDeclaration =
    (prefixes: Prefixes) => Object.entries(prefixes).map(([k, v]) => `PREFIX ${k}: <${v}>`).join('\n')

export * from './jsonSchema2construct'
export * from './remoteSparqlQuery'
export * from './selectQuery'
