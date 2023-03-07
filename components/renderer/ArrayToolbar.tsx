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

import ValidationIcon from './ValidationIcon'

export interface ArrayLayoutToolbarProps {
  label: string;
  errors: string;
  path: string;
  addItem(path: string, data: any): () => void;
  createDefault(): any;
  readonly?: boolean
}
export const ArrayLayoutToolbar = React.memo(
  ({
    label,
    errors,
    addItem,
    path,
    createDefault,
      readonly
  }: ArrayLayoutToolbarProps) => {
    const {t} = useTranslation()
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

