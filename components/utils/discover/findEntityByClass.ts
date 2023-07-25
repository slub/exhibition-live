import {variable} from '@rdfjs/data-model'
import {SELECT} from '@tpluscode/sparql-builder'

import {defaultPrefix, defaultQueryBuilderOptions} from '../../form/formConfigs'
import {defaultQuerySelect} from '../sparql/remoteOxigraph'

const findEntityByClass = async (searchString: string | null, typeIRI: string, doQuery: (query: string) => Promise<any>, limit: number = 10) => {
  const subjectV = variable('subject'),
      nameV = variable('name'),
      titleV = variable('title'),
      descriptionV = variable('description'),
      concatenatedV = variable('concatenated'),
      safeNameV = variable('safeName'),
      safeTitleV = variable('safeTitle'),
      safeDescriptionV = variable('safeDescription'),
      oneOfTitleV = variable('oneOfTitle')
  let query = (searchString && searchString.length > 0)
      ? SELECT.DISTINCT` ${subjectV} ${oneOfTitleV}`.WHERE`
          ${subjectV} a <${typeIRI}> .
            OPTIONAL {${subjectV} :name ${nameV} .}
            OPTIONAL {${subjectV} :title ${titleV} .}
            OPTIONAL {${subjectV} :description ${descriptionV} .}

            BIND (COALESCE(${nameV}, "") AS ${safeNameV})
            BIND (COALESCE(${titleV}, "") AS ${safeTitleV})
            BIND (COALESCE(${descriptionV}, "") AS ${safeDescriptionV})
    
            BIND (CONCAT(${safeNameV}, " ", ${safeTitleV}, " ", ${safeDescriptionV}) AS ${concatenatedV})
            BIND (COALESCE(${nameV}, ${titleV}, ${descriptionV}, "") AS ${oneOfTitleV})
            FILTER(contains(lcase(${concatenatedV}), lcase("${searchString}") )) .
            FILTER isIRI(${subjectV})
            FILTER (strlen(${oneOfTitleV}) > 0)
        `.LIMIT(limit).build(defaultQueryBuilderOptions)
      : SELECT.DISTINCT` ${subjectV} ${oneOfTitleV}`.WHERE`
          ${subjectV} a <${typeIRI}> .
            OPTIONAL {${subjectV} :name ${nameV} .}
            OPTIONAL {${subjectV} :title ${titleV} .}
            OPTIONAL {${subjectV} :description ${descriptionV} .}
            BIND (COALESCE(${nameV}, ${titleV}, ${descriptionV}, "") AS ${oneOfTitleV})
            FILTER isIRI(${subjectV})  			
            FILTER (strlen(${oneOfTitleV}) > 0)
        `.LIMIT(limit).build(defaultQueryBuilderOptions)
  query = `PREFIX : <${defaultPrefix}> ` + query
  try {
    const bindings = await doQuery(query)
    return bindings.map((binding: any) => ({
      name: binding[oneOfTitleV.value]?.value,
      value: binding[subjectV.value]?.value
    }))
  } catch (e) {
    console.error('Error finding entity by class', e)
    return []
  }

}

export default findEntityByClass

