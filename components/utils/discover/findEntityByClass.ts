import {variable} from '@rdfjs/data-model'
import {SELECT} from '@tpluscode/sparql-builder'

import {defaultPrefix, defaultQueryBuilderOptions} from '../../form/formConfigs'
import {defaultQuerySelect} from '../sparql/remoteOxigraph'

const findEntityByClass = async (searchString: string, typeIRI: string, endpoint: string) => {
  const subjectV = variable('subject'),
      nameV = variable('name')
  let query = SELECT.DISTINCT` ${subjectV} ${nameV}`.WHERE`
          ${subjectV} a <${typeIRI}> ;
            :name ${nameV} . 
            FILTER(contains(lcase(${nameV}), lcase("${searchString}") )) .
`.LIMIT(10).build(defaultQueryBuilderOptions)
  query = `PREFIX : <${defaultPrefix}> ` + query
  const bindings = await defaultQuerySelect(query, endpoint)
  return bindings.map(binding => ({name: binding[nameV.value]?.value, value: binding[subjectV.value]?.value}))

}

export default findEntityByClass

