import df from '@rdfjs/data-model'
import namespace from '@rdfjs/namespace'
import {NamedNode, Quad} from '@rdfjs/types'
import {rdf, xsd} from '@tpluscode/rdf-ns-builders'
import {isArray, toLower} from 'lodash'

import {filterUndefOrNull} from '../../utils/core'
import {Datafield, SubfieldElement} from '../../utils/k10plus/searchRetrieveResponse-types'
import {Prefixes} from '../../utils/types'
import {mappingSkeleton, marcMappingPrefixes} from './marc2rdfMappingDeclaration'

const findMappingForSubfield = (tag: string) => {
  const tagMappingKey: string | undefined = Object.keys(mappingSkeleton.tags).find(tagPattern => (new RegExp(tagPattern).test(tag)))
  return mappingSkeleton.tags[tagMappingKey]
}

export const kxp: Record<string, NamedNode<string>> & { (property?: (TemplateStringsArray | string)): NamedNode } = namespace('http://kxp.k10plus.de/ontology/')
export const kxpPrefixes : Prefixes= {
  rdf: rdf().value,
  kxrecord: kxp('record/').value,
  kxp: kxp().value,
  ...Object.fromEntries(marcMappingPrefixes.map(p => [p.prefix, p.uri]))
}
const toLiteral = (value: string | number | boolean) => {
  if (typeof value === 'number') {
    return df.literal(String(value), xsd.integer)
  }
  if (typeof value === 'boolean') {
    return df.literal(String(value), xsd.boolean)
  }
  return df.literal(value)
}

const makeIRI = (value: string | undefined) => {
  if (!value?.includes('.')) {
    return kxp(value || '')
  }
  const [prefix, localName] = value.split('.')
  const vocab = marcMappingPrefixes.find(p => p.prefix === toLower(prefix))
  return (!vocab) ? kxp(localName) : df.namedNode(vocab.uri + localName)
}
export const mapDatafieldToQuads: (subjectNode: NamedNode<string>, ds: Datafield) => Quad[] = (subjectNode , ds) => {
  const tag = ds['@_tag']
  const mapping = findMappingForSubfield(tag)
  const quads: Quad[] = []
  if (mapping) {
    if (mapping.subfield) {
      Object.entries(mapping.subfield).forEach(([code, subfieldMapping]: [string, any]) => {
        if (isArray(ds.subfield)) {
          const text = ds.subfield.filter(sf => sf['@_code'] === code).map(sf => sf['#text'])
          if (subfieldMapping.relation) {
            if (text.length > 0) {
              console.warn('More than one subfield found for code ' + code)
            }
            const objectNode = df.blankNode()
            const {subfield, class: clazz} = subfieldMapping.relation
            const { conditions, predicate } = subfieldMapping
            let realPredicate = predicate
            if (conditions) {
              const possiblePredicates = filterUndefOrNull(Object.entries(conditions.subfield).map(([subfieldCode, condSubfieldMapping]: [string, any]) => {
                const { default: default_ , subs} = condSubfieldMapping
                const subKeys = Object.keys(subs || {})
                if (isArray(ds.subfield)) {
                  const subfieldText = ds.subfield.filter(sf => sf['@_code'] === subfieldCode).map(sf => sf['#text'])
                  for(const subText of subfieldText) {
                    if(subKeys.includes(String(subText))) {
                      return  subs[subText]
                    }
                  }
                }
                return default_ as string | undefined
              }))
              realPredicate = possiblePredicates[0]
            }
            if(!realPredicate) {
              console.warn('No predicate found for subfield ' + code)
            }
            quads.push(df.quad(subjectNode, makeIRI(realPredicate), objectNode))
            quads.push(df.quad(objectNode, rdf.type, makeIRI(clazz)))
            if (subfield) {
              Object.entries(subfield).forEach(([key, value]: [string, any]) => {
                const subText = (ds.subfield as SubfieldElement[]).filter(sf => sf['@_code'] === key).map(sf => sf['#text'])
                subText.forEach(t => {
                  quads.push(df.quad(objectNode, makeIRI(value.predicate), toLiteral(t)))
                })
              })
            }
          }
          text.forEach(t => {
            quads.push(df.quad(subjectNode, makeIRI(subfieldMapping.predicate), toLiteral(t)))
          })
        } else {
          if (ds.subfield['@_code'] === code) {
            const text = ds.subfield['#text']
            quads.push(df.quad(subjectNode, makeIRI(subfieldMapping.predicate), toLiteral(text)))
          }
        }
      })
    }
  }
  return quads
}
