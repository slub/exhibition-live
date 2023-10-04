import {Add as NewIcon} from '@mui/icons-material'
import {Avatar, Box, Button, ButtonBase, Card, Grid, InputAdornment, OutlinedInput, Popper} from '@mui/material'
// material-ui
import {styled, useTheme} from '@mui/material/styles'
import {shouldForwardProp} from '@mui/system'
// assets
import {useRouter} from 'next/router'
import PropTypes from 'prop-types'
import React, {useCallback, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {v4 as uuidv4} from 'uuid'

// third-party
// project imports
import DiscoverAutocompleteInput from '../../form/discover/DiscoverAutocompleteInput'
import {sladb, slent} from '../../form/formConfigs'
import {useGlobalSearch} from '../../state'
import {encodeIRI} from '../../utils/core'

// styles
const PopperStyle = styled(Popper, {shouldForwardProp})(({theme}) => ({
  zIndex: 1100,
  width: '99%',
  top: '-55px !important',
  padding: '0 12px',
  [theme.breakpoints.down('sm')]: {
    padding: '0 10px'
  }
}))

const OutlineInputStyle = styled(OutlinedInput, {shouldForwardProp})(({theme}) => ({
  width: 434,
  marginLeft: 16,
  paddingLeft: 16,
  paddingRight: 16,
  '& input': {
    background: 'transparent !important',
    paddingLeft: '4px !important'
  },
  [theme.breakpoints.down('lg')]: {
    width: 250
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    marginLeft: 4,
    background: '#fff'
  }
}))

const HeaderAvatarStyle = styled(Avatar, {shouldForwardProp})(({theme}) => ({
// @ts-ignore
  ...theme.typography.commonAvatar,
// @ts-ignore
  ...theme.typography.mediumAvatar,
  background: theme.palette.secondary.light,
  color: theme.palette.secondary.dark,
  '&:hover': {
    background: theme.palette.secondary.dark,
    color: theme.palette.secondary.light
  }
}))

// ==============================|| SEARCH INPUT - MOBILE||============================== //

export const MobileSearch = ({value, setValue, popupState}) => {
  const theme = useTheme()

  return (<>mobile</>)

}

MobileSearch.propTypes = {
  value: PropTypes.string,
  setValue: PropTypes.func,
}

// ==============================|| SEARCH INPUT ||============================== //

export const SearchSection = () => {
  const { t } = useTranslation()
  const {search, setSearch} = useGlobalSearch()
  const router = useRouter()
  const {typeName} = router.query as { typeName: string | null | undefined }
  const classIRI: string | undefined = typeof typeName === 'string' ? sladb(typeName).value : undefined

  const handleChange = useCallback((value?: string | null) => {
        value && router.push(`/create/${typeName}/${encodeIRI(value)}`)
      }, [typeName])

  const handleNew = useCallback(() => {
    const newId = slent( uuidv4() ).value
    router.push(`/create/${typeName}/${encodeIRI(newId)}`)
  }, [typeName])

  const handleSearchTextChange = useCallback((search) => {
        setSearch(search)
      }, [setSearch])

  return !typeName ? null : (
        <Box
            sx={{
              paddingLeft: 4,
              paddingRight: 2,
            }}
        >
          <Grid container spacing={2}>
            {classIRI && typeName && <>
                <Grid item xs={11}>
                    <DiscoverAutocompleteInput
                        key={typeName}
                        typeIRI={classIRI}
                        limit={1000}
                        condensed
                        inputProps={
                          {
                            placeholder: `Suche nach ${typeName}`,
                            variant: 'outlined',
                          }
                        }
                        title={typeName}
                        typeName={typeName}
                        onDebouncedSearchChange={handleSearchTextChange}
                        onSelectionChange={selection => handleChange(selection?.value)}/>
                </Grid>
                <Grid item xs={1}>
                    <Button onClick={handleNew} aria-label={'neuen Eintrag erstellen'} startIcon={<NewIcon/>}> {t(typeName)} </Button>
                </Grid>
            </>}
          </Grid>
        </Box>
  )
}
