import {Menu as IconMenu} from '@mui/icons-material'
// material-ui
import {Avatar, Box, ButtonBase, useTheme} from '@mui/material'
import React, {useState} from 'react'

import {useFormRefsContext} from '../../provider/formRefsContext'
import {Logo} from './Logo'
import {SearchSection} from './SearchSection'


const LogoSection = ()  => (<><Logo /></>)
const ProfileSection = ()  => (<>ProfileSection</>)

type AppHeaderProps = {
}
export const AppHeader = () => {
  const theme = useTheme()

  const { actionRef, toolbarRef} = useFormRefsContext()

  return (
    <>
      {/* logo */}
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

