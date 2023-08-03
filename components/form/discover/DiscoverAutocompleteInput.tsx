import {variable} from '@rdfjs/data-model'
import {SELECT} from '@tpluscode/sparql-builder'
import parse from 'html-react-parser'
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react'

import {useGlobalCRUDOptions} from '../../state/useGlobalCRUDOptions'
import {useSettings} from '../../state/useLocalSettings'
import findEntityByClass from '../../utils/discover/findEntityByClass'
import {defaultQuerySelect} from '../../utils/sparql/remoteOxigraph'
import {AutocompleteSuggestion, DebouncedAutocomplete} from '../DebouncedAutoComplete'
import {defaultPrefix, defaultQueryBuilderOptions} from '../formConfigs'

interface OwnProps {
  selected?: AutocompleteSuggestion | null
  onSelectionChange?: (selection: AutocompleteSuggestion | null) => void
  typeIRI?: string
  title?: string
  typeName?: string
  readonly?: boolean
  defaultSelected?: AutocompleteSuggestion | null
  loadOnStart?: boolean
  limit?: number
  onDebouncedSearchChange?: (value: string | undefined) => void;
  condensed?: boolean
}

type Props = OwnProps;

const DiscoverAutocompleteInput: FunctionComponent<Props> = ({title = 'etwas', typeName, readonly, defaultSelected, selected, onSelectionChange, typeIRI: classType, loadOnStart, limit, onDebouncedSearchChange, condensed}) => {
  const { crudOptions } = useGlobalCRUDOptions()
  const [ selected__, setSelected__] = useState<AutocompleteSuggestion | null>(selected  || defaultSelected || null)

  const handleChange = useCallback(
      (_e: Event, item: AutocompleteSuggestion | null) => {
        onSelectionChange && onSelectionChange(item)
        setSelected__(item)
      },
      [onSelectionChange, setSelected__],
  )

  const load = useCallback(
      async (searchString?: string) => ( classType && crudOptions)
            ? (await findEntityByClass(searchString || null, classType, crudOptions.selectFetch, limit)).map(({name= '', value}: {name: string, value: any}) => {
              return {
                label: name,
                value
              }
            })
            : [],
      [classType, crudOptions, limit])


  return <DebouncedAutocomplete
            title={title}
            readOnly={readonly}
            loadOnStart={true}
            ready={Boolean(classType && crudOptions)}
            // @ts-ignore
            load={load}
            value={selected__}
            placeholder={`Suche nach ${typeName} in der aktuellen Datenbank`}
            renderOption={(props, option: any) => (
                <li {...props} key={option.value}>
                  {parse(`<span class="debounced_autocomplete_option_label">${option.label}</span>`)}
                </li>
            )}
            // @ts-ignore
            onChange={handleChange}
            onDebouncedSearchChange={onDebouncedSearchChange}
            condensed={condensed}

        />
}

export default DiscoverAutocompleteInput
