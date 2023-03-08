import React, {FunctionComponent, useCallback, useMemo, useState} from 'react'

import findEntityWithinLobid from '../../utils/lobid/findEntityWithinLobid'
import {AutocompleteSuggestion, DebouncedAutocomplete} from '../DebouncedAutoComplete'

interface OwnProps {
    selected?: AutocompleteSuggestion | null
    onSelectionChange?: (selection: AutocompleteSuggestion | null) => void
    typeName?: string
}

type Props = OwnProps;

const buildLabelFromSuggestion: (suggestion: AutocompleteSuggestion) => string
    = ({value, label}) => `${label}, GND: ${value}`

const LobidAutocompleteSearch: FunctionComponent<Props> = ({selected, onSelectionChange, typeName}) => {
    const [_selected, setSelected] = useState<AutocompleteSuggestion | null>(null)

    const __selected = useMemo(() => selected || _selected, [selected, _selected])

    const handleChange = useCallback(
        (_e: Event, item: AutocompleteSuggestion | null) => {
            const __onSelectionChange = onSelectionChange || setSelected
            __onSelectionChange(item)
        },
        [onSelectionChange, setSelected],
    )

  return (
        <DebouncedAutocomplete
            minSearchLength={3}
            load={async (searchString) => searchString
                ? (await findEntityWithinLobid(searchString, typeName || 'Person',50))?.member?.map(
                    // @ts-ignore
                    ({id,
                       preferredName = '',
                       dateOfBirth = [],
                       dateOfDeath = [],
                       // @ts-ignore
                        dateOfBirthAndDeath
                     }) => ({
                    value: id,
                    label: `${preferredName} | ${dateOfBirthAndDeath?.[0] ? dateOfBirthAndDeath[0] : `${dateOfBirth[0] || ''} | ${dateOfDeath[0] || ''}`}`
                }))
                : []}
            placeholder="Search a person within Lobid"
            getOptionLabel={buildLabelFromSuggestion}
            onChange={(_event: any, item: AutocompleteSuggestion | null) => {
                onSelectionChange && onSelectionChange(item)
            }}/>
    )
}

export default LobidAutocompleteSearch
