import {ComponentMeta} from '@storybook/react'
import React from 'react'

import LobidAutocompleteSearch from './LobidAutocompleteSearch'

export default {
  title: 'form/lobid/LobidAutocomplete',
  component: LobidAutocompleteSearch
} as ComponentMeta<typeof LobidAutocompleteSearch>

export const LobID = () => <LobidAutocompleteSearch typeName={'Person'} />
