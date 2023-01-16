import {QueryEngine} from "@comunica/query-sparql";
import {BindingsStream} from "@comunica/types";
import {Literal, NamedNode} from "@rdfjs/types";
import {gndPrefixes} from "./prefixes";
import {prefixes2sparqlPrefixDeclaration} from "../sparql";

export type GNDSearchResultEntry = {
  gndid: string
  literal: string
  score: number
}

const searchPersonWithinGNDQuery = (searchString: string, limit: number = 10) => `
${prefixes2sparqlPrefixDeclaration(gndPrefixes)}
SELECT DISTINCT ?gndid ?score ?literal WHERE
{
  (?gndid ?score ?literal) text:query "${searchString}~" .
  ?gndid a gndo:DifferentiatedPerson .
} LIMIT ${limit}
`

const findPersonWithinGND = async (searchString: string, limit?: number) => {
  const myEngine = new QueryEngine();
  const bindingsStream: BindingsStream = await myEngine.queryBindings(searchPersonWithinGNDQuery(searchString, limit), {
        sources: ['http://gnd4c.digicult-verbund.de:3030/gndt/sparql'],
      }
  );
  let results: GNDSearchResultEntry[] = []
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
