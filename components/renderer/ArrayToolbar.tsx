import AddIcon from '@mui/icons-material/Add'
import {
  Grid,
  Hidden,
  IconButton,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material'
import * as React from 'react'
import {useTranslation} from 'react-i18next'
import {v4 as uuidv4} from 'uuid'

import ValidationIcon from './ValidationIcon'
import DiscoverAutocompleteInput from "../form/discover/DiscoverAutocompleteInput";
import {useMemo} from "react";
import {JsonSchema7} from "@jsonforms/core";
import {sladb, slent} from "../form/formConfigs";

export interface ArrayLayoutToolbarProps {
  label: string;
  errors: string;
  path: string;
  addItem(path: string, data: any): () => void;
  createDefault(): any;
  readonly?: boolean
  typeIRI?: string
}

export const getDefaultKey = (typeIRI?: string) => {
  console.log('getDefaultKey', typeIRI)
  if(!typeIRI) return 'title'
  if(typeIRI === sladb.ExhibitionWebLink.value) return 'weblink'
  return 'title'
}
export const ArrayLayoutToolbar = React.memo(
  ({
    label,
    errors,
    addItem,
    path,
      schema,
    createDefault,
      readonly,
  }: ArrayLayoutToolbarProps & {schema?: JsonSchema7}) => {
    const {t} = useTranslation()
    const typeIRI = useMemo(() => schema?.properties?.['@type']?.const, [schema])
    const handleChange_ = React.useCallback(
      (value: any) => {
        addItem(path, {
          '@id': value
        })()
      }, [addItem, path]  )
    const handleCreateNewFromSearch = React.useCallback(
      (value?: string) => {
        if(!value) return
        addItem(path, {
          '@id': slent(uuidv4()).value,
          '@type': typeIRI,
          [getDefaultKey(typeIRI)]: value
        })()
      }, [addItem, path, typeIRI]
    )
    return (
      <Toolbar disableGutters={true}>
        <Grid container alignItems='center' justifyContent='space-between'>
          <Grid item>
            <Typography variant={'h6'}>{label}</Typography>
          </Grid>
          <Hidden xsUp={errors.length === 0}>
            <Grid item>
              <ValidationIcon id='tooltip-validation' errorMessages={errors} />
            </Grid>
          </Hidden>
          <Grid item>
            <Grid container sx={{visibility: readonly ? 'hidden' : 'visible'}}>
                <Grid item flex={1} sx={{minWidth: '25em'}}>
                  <DiscoverAutocompleteInput
                      typeIRI={typeIRI}
                      title={label || ''}
                      onEnterSearch={handleCreateNewFromSearch}
                      onSelectionChange={selection => handleChange_(selection?.value)}/>
                </Grid>
              <Grid item>
                <Tooltip
                  id='tooltip-add'
                  title={t('add_another', {item: label}) || ''}
                  placement='bottom'
                >
                  <IconButton
                    aria-label={t('add_another', {item: label})}
                    onClick={addItem(path, createDefault())}
                    size='large'>
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Toolbar>
    )
  }
)

