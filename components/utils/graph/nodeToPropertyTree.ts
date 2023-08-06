import df from '@rdfjs/data-model'
import {BlankNode, NamedNode, Term} from '@rdfjs/types'
import clownface, {AnyPointer} from 'clownface'

export type NodePropertyTree = {
  [key: string]: NodePropertyItem[]
}

export type NodePropertyItem = {
  value: string,
  term: Term,
  termType: string,
  properties?: NodePropertyTree
}
export const nodeToPropertyTree: (node: NamedNode | BlankNode, ds: AnyPointer, level?: number, maxDepth?: number) => NodePropertyTree | undefined =
    (node, ds, level = 0, maxDepth = 3) => {
      if (level >= maxDepth) return undefined
      const predicates = new Set<string>()
      // @ts-ignore
      for (const quad of ds.dataset.match(node, null, null)) {
        predicates.add(quad.predicate.value)
      }
      const startNode: clownface.GraphPointer = ds.node(node)
      return Object.fromEntries(Array.from(predicates).map(predicate => {
        const objects = startNode.out(df.namedNode(predicate))
        const po = objects.map(quad => {
          const termType = quad.term.termType
          const properties = (termType === 'BlankNode' || termType === 'NamedNode') ? nodeToPropertyTree(quad.term, ds, level + 1, maxDepth) : undefined
          return {
            ...(properties ? {properties} : {}),
            value: quad.value,
            term: quad.term,
            termType
          }
        })
        return [predicate, po]
      }))

    }
