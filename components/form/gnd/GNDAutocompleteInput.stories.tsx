import React from 'react'
import {ComponentMeta} from "@storybook/react";
import GNDAutocompleteInput from "./GNDAutocompleteInput";

export default {
  title: 'form/gnd/GNDAutoCompleteInput',
  component: GNDAutocompleteInput
} as ComponentMeta<typeof GNDAutocompleteInput>

export const GNDAutocompleteInputDefault = () => <GNDAutocompleteInput />
