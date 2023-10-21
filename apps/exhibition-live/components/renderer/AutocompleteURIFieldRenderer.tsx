import {ControlProps, showAsRequired, update} from '@jsonforms/core'
import {withJsonFormsControlProps} from '@jsonforms/react'
import {Edit, EditOff} from '@mui/icons-material'
import {FormControl, FormLabel, Grid, Hidden, IconButton} from '@mui/material'
import merge from 'lodash/merge'
import React, {useCallback, useEffect, useMemo, useState} from 'react'

import {AutocompleteSuggestion} from '../form/DebouncedAutoComplete'
import WikidataAutocompleteInput from '../form/wikidata/WikidataAutocompleteInput'


const AutocompleteURIFieldRenderer = (props: ControlProps) => {
  const {
    id,
    errors,
    label,
    schema,
    uischema,
    visible,
    required,
    config,
    data,
    handleChange,
    path
  } = props
  const isValid = errors.length === 0
  const appliedUiSchemaOptions = merge({}, config, uischema.options)
  const [selected, setSelected] = useState<AutocompleteSuggestion | null>(null)


  const classType = useMemo(() => schema.format?.substring('wikidata-'.length), [schema])

const handleChange_ = useCallback(
    (v?: string) => {
      handleChange(path, v)
    },
    [path, handleChange],
)

useEffect(() => {
  handleChange_(selected ? `http://www.wikidata.org/entity/${selected.value}` : undefined)
}, [selected, handleChange_])


return (
    <Hidden xsUp={!visible}>
      <FormControl
          fullWidth={!appliedUiSchemaOptions.trim}
          id={id}
          variant={'standard'}
          sx={theme => ({marginBottom: theme.spacing(2)})}
          hiddenLabel={true}
      >
        <Grid container alignItems='baseline'>
          <Grid item>
            <FormLabel
                error={!isValid}
                required={showAsRequired(!!required,
                    appliedUiSchemaOptions.hideRequiredAsterisk)}
            >
              Wikidata
            </FormLabel>
          </Grid>{' '}
          <Grid item>
            {data}
          </Grid>
        </Grid>
        <WikidataAutocompleteInput selected={selected} onSelectionChange={setSelected} typeOf={classType}/>
      </FormControl>
    </Hidden>
)
}

export default withJsonFormsControlProps(AutocompleteURIFieldRenderer)
