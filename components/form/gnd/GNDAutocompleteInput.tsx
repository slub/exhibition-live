import React, {FunctionComponent, useCallback, useMemo, useState} from 'react'

import findPersonWithinGND from '../../utils/gnd/findpersonWithinGND'
import {AutocompleteSuggestion, DebouncedAutocomplete} from '../DebouncedAutoComplete'

interface OwnProps {
    selected?: AutocompleteSuggestion | null
    onSelectionChange?: (selection: AutocompleteSuggestion | null) => void
    typeOf?: string
}

type Props = OwnProps;

const buildLabelFromSuggestion: (suggestion: AutocompleteSuggestion) => string
    = ({value, label}) => `${label}, GND: ${value}`

const GNDAutocompleteInput: FunctionComponent<Props> = ({typeOf, selected, onSelectionChange, typeOf: classType}) => {
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
                ? (await findPersonWithinGND(searchString, 50, classType)).map(({gndid, literal}) => ({
                    label: literal,
                    value: gndid
                }))
                : []}
            placeholder={`Suche innerhalb der GND (${typeOf})`}
            getOptionLabel={buildLabelFromSuggestion}
            onChange={(_event: any, item: AutocompleteSuggestion | null) => {
                onSelectionChange && onSelectionChange(item)
            }}/>
    )
}

export default GNDAutocompleteInput
