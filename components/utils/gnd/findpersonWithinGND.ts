import {QueryEngine} from '@comunica/query-sparql'
import {BindingsStream} from '@comunica/types'
import {Literal, NamedNode} from '@rdfjs/types'

import {prefixes2sparqlPrefixDeclaration} from '../sparql'
import {gndPrefixes} from './prefixes'

export type GNDSearchResultEntry = {
  gndid: string
  literal: string
  score: number
}

const searchPersonWithinGNDQuery = (searchString: string, limit: number = 10, type: string) => `
${prefixes2sparqlPrefixDeclaration(gndPrefixes)}
SELECT DISTINCT ?gndid ?score ?literal WHERE
{
  (?gndid ?score ?literal) text:query "${searchString}~" .
  ?gndid a gndo:${type} .
} LIMIT ${limit}
`

const findPersonWithinGND = async (searchString: string, limit?: number, classType?: string) => {
  const myEngine = new QueryEngine()
  const bindingsStream: BindingsStream = await myEngine.queryBindings(searchPersonWithinGNDQuery(searchString, limit, classType || 'DifferentiatedPerson'), {
        sources: ['http://gnd4c.digicult-verbund.de:3030/gndt/sparql'],
      }
  )
  const results: GNDSearchResultEntry[] = []
  for (const binding of await bindingsStream.toArray()) {
    results.push({
      gndid: (binding.get('gndid') as NamedNode).value,
      literal: (binding.get('literal') as Literal).value,
      score: parseFloat((binding.get('score') as Literal).value)
    })
  }
  return results
}

export default findPersonWithinGND
