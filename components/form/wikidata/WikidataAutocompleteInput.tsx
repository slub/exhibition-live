import {Typography} from '@mui/material'
import parse from 'html-react-parser'
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react'

import {remoteSparqlQuery, sparqlSelectViaFieldMappings} from '../../utils/sparql'
import {findPersonWithinWikidataUsingREST, wikidataPrefixes} from '../../utils/wikidata'
import {AutocompleteSuggestion, DebouncedAutocomplete} from '../DebouncedAutoComplete'
import WikidataHumanCard from './WikidataHumanCard'
import WikidataThingCard from './WikidataThingCard'

interface OwnProps {
  selected?: AutocompleteSuggestion | null
  onSelectionChange?: (selection: AutocompleteSuggestion | null) => void
  typeOf?: string
}

type Props = OwnProps;

type WikidataEntityInfo = {
  '@id': string
  label: string
  description: string
}



const getTextFromHTML: (html: string) => null | string = (html) => {
  const
      document = (new DOMParser()).parseFromString(html, 'text/html'),
      el = document.querySelector('body')
  return el?.textContent ? el.textContent.trim() : null
}

const buildLabelFromSuggestion: (suggestion: AutocompleteSuggestion) => string =
    ({label, value}) => `${getTextFromHTML(`<html><body>${label}</body></html>`)}, wikidata: ${value}`

const WikidataAutocompleteInput: FunctionComponent<Props> = ({selected, onSelectionChange, typeOf: classType}) => {
  const [_selected, setSelected] = useState<AutocompleteSuggestion | null>(null)

  const __selected = useMemo(() => selected || _selected, [selected, _selected])

  const handleChange = useCallback(
      (_e: Event, item: AutocompleteSuggestion | null) => {
        const __onSelectionChange = onSelectionChange || setSelected
        __onSelectionChange(item)
      },
      [onSelectionChange, setSelected],
  )

  const [classInfo, setClassInfo] = useState<WikidataEntityInfo | null>(null)
  useEffect(() => {
    if (!classType) return
    sparqlSelectViaFieldMappings(`wd:${classType}`, {
      fieldMapping: {},
      includeLabel: true,
      includeDescription: true,
      wrapAround: [
        `SERVICE wikibase:label {
              bd:serviceParam wikibase:language "en" .`, '}'],
      prefixes: wikidataPrefixes,
      permissive: true,
      query: (sparqlSelect: string) => remoteSparqlQuery(sparqlSelect, ['https://query.wikidata.org/sparql'])
    }).then(_classInfo => {
      setClassInfo({'@id': `wd:${classType}`, ..._classInfo} as WikidataEntityInfo)
    })
  }, [setClassInfo, classType])


  return (<>
        <DebouncedAutocomplete
            minSearchLength={3}
            load={async (searchString) => searchString
                ? (await findPersonWithinWikidataUsingREST(searchString, 10, classType)).map(d => {
                  return d
                }).map((
                    { key,
                      excerpt: snippet
                     }) => ({
                  label: snippet.split('\n')[0],
                  value: key
                }))
                : []}
            value={__selected}
            placeholder={`Suche innerhalb der Wikidata (${classType})`}
            getOptionLabel={buildLabelFromSuggestion}
            renderOption={(props, option: any) => (
                <li {...props} key={option.value}>
                  {parse(`<span class="debounced_autocomplete_option_label">${option.label}</span>`)}
                  {option.value}
                </li>
            )}
            // @ts-ignore
            onChange={handleChange}
        />
        { __selected?.value ? ( classType === 'Q5'
            ? <WikidataHumanCard personIRI={__selected.value} />
                : <WikidataThingCard thingIRI={__selected.value} />  ) : null}
      </>
  )
}

export default WikidataAutocompleteInput
