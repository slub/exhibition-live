import {variable} from '@rdfjs/data-model'
import {SELECT} from '@tpluscode/sparql-builder'
import parse from 'html-react-parser'
import React, {FunctionComponent, useCallback, useMemo, useState} from 'react'

import {defaultQuerySelect} from '../../utils/sparql/remoteOxigraph'
import {AutocompleteSuggestion, DebouncedAutocomplete} from '../DebouncedAutoComplete'
import {defaultPrefix, defaultQueryBuilderOptions} from '../formConfigs'

interface OwnProps {
  selected?: AutocompleteSuggestion | null
  onSelectionChange?: (selection: AutocompleteSuggestion | null) => void
  typeIRI?: string
  title?: string
}

type Props = OwnProps;



const findEntityByClass = async (searchString: string, typeIRI: string) => {
  const subjectV = variable('subject'),
      nameV = variable('name')
  let query = SELECT.DISTINCT` ${subjectV} ${nameV}`.WHERE`
          ${subjectV} a <${typeIRI}> ;
            :name ${nameV} . 
            FILTER(contains(${nameV}, "${searchString}")) .
`.LIMIT(10).build(defaultQueryBuilderOptions)
  query = `PREFIX : <${defaultPrefix}> ` + query
  const bindings = await defaultQuerySelect(query)
  return bindings.map(binding => ({name: binding[nameV.value]?.value, value: binding[subjectV.value]?.value}))

}


const DiscoverAutocompleteInput: FunctionComponent<Props> = ({title = 'etwas', selected, onSelectionChange, typeIRI: classType}) => {
  const [_selected, setSelected] = useState<AutocompleteSuggestion | null>(null)

  const __selected = useMemo(() => selected || _selected, [selected, _selected])

  const handleChange = useCallback(
      (_e: Event, item: AutocompleteSuggestion | null) => {
        const __onSelectionChange = onSelectionChange || setSelected
        __onSelectionChange(item)
      },
      [onSelectionChange, setSelected],
  )


  return (<>
        <DebouncedAutocomplete
            // @ts-ignore
            load={async (searchString) => ((searchString && classType)
                ? (await findEntityByClass(searchString, classType)).map(({name= '', value}) => {
                  return {
                    label: name,
                    value
                  }
                })
                : [])}
            value={__selected}
            placeholder={`Search for ${title} within the current knowledge base`}
            renderOption={(props, option: any) => (
                <li {...props} key={option.value}>
                  {parse(`<span class="debounced_autocomplete_option_label">${option.label}</span>`)}
                </li>
            )}
            // @ts-ignore
            onChange={handleChange}
        />
      </>
  )
}

export default DiscoverAutocompleteInput
