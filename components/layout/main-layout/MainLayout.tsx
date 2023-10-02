// assets
import { ChevronRight  as IconChevronRight } from '@mui/icons-material'
import { AppBar, Box, CssBaseline, styled, Theme, Toolbar, useMediaQuery, useTheme } from '@mui/material'
import {useCallback, useState} from 'react'

import {AppHeader} from './AppHeader'
import {Sidebar} from './Sidebar'

export const gridSpacing = 3
export const drawerWidth = 260
export const appDrawerWidth = 320

type MainProps = {
  theme: Theme,
  open: boolean
}

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }: MainProps) => ({
  // @ts-ignore
  ...theme.typography.mainContent,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  transition: theme.transitions.create(
      'margin',
      open
          ? {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
          }
          : {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
          }
  ),
  [theme.breakpoints.up('md')]: {
    marginLeft: open ? 0 : -(drawerWidth - 20),
    width: `calc(100% - ${drawerWidth}px)`
  },
  [theme.breakpoints.down('md')]: {
    marginLeft: '20px',
    width: `calc(100% - ${drawerWidth}px)`,
    padding: '16px'
  },
  [theme.breakpoints.down('sm')]: {
    marginLeft: '10px',
    width: `calc(100% - ${drawerWidth}px)`,
    padding: '16px',
    marginRight: '10px'
  }
}))


export const MainLayout = ({ children }: {children: React.ReactNode}) => {
  const theme = useTheme()
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'))
  // Handle left drawer
  const [leftDrawerOpened, setLeftDrawerOpened] = useState<boolean>(false)
  const handleLeftDrawerToggle = useCallback(() => {
        setLeftDrawerOpened(o => !o)
      },
      [setLeftDrawerOpened])


  return (
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        {/* header */}
        <AppBar
            enableColorOnDark
            position="fixed"
            color="inherit"
            elevation={0}
            sx={{
              bgcolor: theme.palette.background.default,
              transition: leftDrawerOpened ? theme.transitions.create('width') : 'none'
            }}
        >
          <Toolbar>
            <AppHeader handleLeftDrawerToggle={handleLeftDrawerToggle} />
          </Toolbar>
        </AppBar>

        <Sidebar drawerOpen={!matchDownMd ? leftDrawerOpened : !leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} />

        {/*@ts-ignore */}
        <Main theme={theme} open={leftDrawerOpened}>
          {children}
        </Main>
      </Box>
  )
}

