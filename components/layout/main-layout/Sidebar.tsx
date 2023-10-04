import {Settings} from '@mui/icons-material'
import {Box, Button, Chip, Drawer, Stack, useMediaQuery, useTheme} from '@mui/material'
import {useQuery} from '@tanstack/react-query'
import {JSONSchema7} from 'json-schema'
import React, {ForwardedRef, useMemo} from 'react'
import {BrowserView, MobileView} from 'react-device-detect'
import PerfectScrollbar from 'react-perfect-scrollbar'

import loadedSchema from '../../../public/schema/Exhibition.schema.json'
import SettingsModal from '../../content/settings/SettingsModal'
import {sladb} from '../../form/formConfigs'
import {useFormRefsContext} from '../../provider/formRefsContext'
import {useLocalSettings} from '../../state/useLocalSettings'
import {drawerWidth} from './MainLayout'
import {MenuGroup, NavGroup, NavItem} from './menu'
import menuLists from './menu/menuLists'


const LogoSection = () => (<>LogoSection</>)

const MenuList = () => {

  const menuGroup = useMemo<MenuGroup | null>(() => {
    return loadedSchema ? menuLists(loadedSchema as JSONSchema7) : null as MenuGroup
  }, [loadedSchema])
  return menuGroup && (<>
    <NavGroup key={menuGroup.id} item={menuGroup}/>
  </>)
}
const MenuCard = () => {
  const { stepperRef} = useFormRefsContext()

  // @ts-ignore
  return (<div ref={stepperRef}></div>)
}

type SidebarProps = {
  drawerOpen: boolean,
  drawerToggle: () => void

}

export const Sidebar = ({drawerOpen, drawerToggle}: SidebarProps) => {
  const theme = useTheme()
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'))
  const {openSettings} = useLocalSettings()

  const drawer = (
      <>
        <Box sx={{display: {xs: 'block', md: 'none'}}}>
          <Box sx={{display: 'flex', p: 2, mx: 'auto'}}>
            <LogoSection/>
          </Box>
        </Box>
        <BrowserView>
          <PerfectScrollbar
              component="div"
              style={{
                height: !matchUpMd ? 'calc(100vh - 56px)' : 'calc(100vh - 88px)',
                paddingLeft: '16px',
                paddingRight: '16px'
              }}
          >
            <MenuCard/>
            <MenuList/>
            <NavItem item={{id: 'setttings', type: 'item', url: '#', icon: () => <Settings />, title: 'Einstellungen'}} level={0} onClick={openSettings} />
            <Stack direction="row" justifyContent="center" sx={{mb: 2}}>
              <Chip label={'Version 1.3.122'} disabled color="secondary" size="small" sx={{cursor: 'pointer'}}/>
            </Stack>
          </PerfectScrollbar>
        </BrowserView>
        <MobileView>
          <Box sx={{px: 2}}>
            <MenuCard/>
            <MenuList/>
            <Stack direction="row" justifyContent="center" sx={{mb: 2}}>
              <Chip label={'Version 1.3.122'} disabled color="secondary" size="small" sx={{cursor: 'pointer'}}/>
            </Stack>
          </Box>
        </MobileView>
        <SettingsModal />
      </>
  )


  return (
      <Box component="nav" sx={{flexShrink: {md: 0}, width: matchUpMd ? drawerWidth : 'auto'}}
           aria-label="mailbox folders">
        <Drawer
            //container={container}
            variant={matchUpMd ? 'persistent' : 'temporary'}
            anchor="left"
            open={drawerOpen}
            onClose={drawerToggle}
            sx={{
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                background: theme.palette.background.default,
                color: theme.palette.text.primary,
                borderRight: 'none',
                [theme.breakpoints.up('md')]: {
                  top: '88px'
                }
              }
            }}
            ModalProps={{keepMounted: true}}
            color="inherit"
        >
          {drawer}
        </Drawer>
      </Box>
  )
}
