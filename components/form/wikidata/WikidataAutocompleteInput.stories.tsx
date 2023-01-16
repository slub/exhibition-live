import {ComponentMeta} from '@storybook/react'
import React from 'react'

import WikidataAutocompleteInput from './WikidataAutocompleteInput'

export default {
  title: 'form/wikidata/WikidataAutoCompleteInput',
  component: WikidataAutocompleteInput
} as ComponentMeta<typeof WikidataAutocompleteInput>

export const WikidataAutocompleteInputDefault = () => <WikidataAutocompleteInput />
