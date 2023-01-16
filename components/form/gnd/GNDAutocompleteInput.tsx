import React, {FunctionComponent, useState} from 'react'

import findPersonWithinGND from '../../utils/gnd/findpersonWithinGND'
import {AutocompleteSuggestion, DebouncedAutocomplete} from '../DebouncedAutoComplete'

interface OwnProps {
}

type Props = OwnProps;

const buildLabelFromSuggestion: (suggestion: AutocompleteSuggestion) => string
    = ({value, label}) => `${label}, GND: ${value}`

const GNDAutocompleteInput: FunctionComponent<Props> = (props) => {
  const [selected, setSelected] = useState<AutocompleteSuggestion | null>(null)

  return (
      <DebouncedAutocomplete
          load={async (searchString) => searchString
              ? (await findPersonWithinGND(searchString, 50)).map(({gndid, literal}) => ({
                label: literal,
                value: gndid
              }))
              : []}
          placeholder="Search a person within the GND"
          getOptionLabel={buildLabelFromSuggestion}
          onChange={(_event: any, item: AutocompleteSuggestion | null) => {
            setSelected(item)
          }}/>
  )
}

export default GNDAutocompleteInput
