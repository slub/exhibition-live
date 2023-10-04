import {Menu as IconMenu, Settings} from '@mui/icons-material'
// material-ui
import {Avatar, Box, Button, ButtonBase, useTheme} from '@mui/material'
import PropTypes from 'prop-types'
import React, {useRef, useState} from 'react'

import SettingsModal from '../../content/settings/SettingsModal'
import {useFormRefsContext} from '../../provider/formRefsContext'
import {useLocalSettings} from '../../state/useLocalSettings'
import { SearchSection } from './SearchSection'


const Logo = () => (<img src={  '/logo.png'} alt="Ausstellungsdatenbank" width="100"/>)
const LogoSection = ()  => (<><Logo /></>)
const ProfileSection = ()  => (<>ProfileSection</>)

type AppHeaderProps = {
  handleLeftDrawerToggle: () => void
}
export const AppHeader = ({ handleLeftDrawerToggle }) => {
  const theme = useTheme()

  const [open, setOpen] = useState(false)
  const { actionRef, toolbarRef} = useFormRefsContext()
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  return (
    <>
      {/* logo & toggler button */}
      <Box
        sx={{
          width: 228,
          display: 'flex',
          [theme.breakpoints.down('md')]: {
            width: 'auto'
          }
        }}
      >
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>
        <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Avatar
            variant="rounded"
            sx={{
              // @ts-ignore
              ...theme.typography.commonAvatar,
              // @ts-ignore
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              background: theme.palette.secondary.light,
              color: theme.palette.secondary.dark,
              stroke: 1.5,
              '&:hover': {
                background: theme.palette.secondary.dark,
                color: theme.palette.secondary.light
              }
            }}
            onClick={handleLeftDrawerToggle}
            color="inherit"
          >
            <IconMenu />
          </Avatar>
        </ButtonBase>
      </Box>

      {/* header search */}
      <SearchSection />
      <Box sx={{flexGrow: 1}} />
      <Box sx={{ flexGrow: 1 }}   ref={actionRef}/>

      {/* notification & profile */}
      {/* @ts-ignore */}
      <div ref={toolbarRef} />
    </>
  )
}

