import {Close as CloseIcon} from '@mui/icons-material'
import {
  AppBar,
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  Toolbar,
  Typography
} from '@mui/material'
import {useTheme} from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import React, {FunctionComponent, useCallback, useState} from 'react'

import {useLocalSettings} from '../../state/useLocalSettings'
import AuthorityConfigForm from './AuthorityConfigForm'
import EndpointChooser from './EndpointChooser'
import FeatureForm from './FeatureForm'
import OpenAISettingsForm from './OpenAISettingsForm'

interface OwnProps {
}

type Props = OwnProps;

const SettingsModal: FunctionComponent<Props> = (props) => {

  const [forceFullscreen, setForceFullscreen] = useState(false)
  const {settingsOpen, closeSettings} = useLocalSettings()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))

  const handleClose = useCallback(() => {
    closeSettings()

  }, [closeSettings])

  return (
      <Dialog
          fullScreen={fullScreen || forceFullscreen}
          open={settingsOpen}
          onClose={handleClose}
          aria-labelledby="responsive-dialog-title"
      >

        <AppBar position="static">
          <Toolbar variant="dense">
            <Box sx={{flexGrow: 3}}>
              <Typography variant="h4" color="inherit" component="div">
                {'Einstellungen'}
              </Typography>
            </Box>
            <IconButton
                size="large"
                aria-label="close without saving"
                onClick={handleClose}
                color="inherit">
              <CloseIcon/>
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <Grid container spacing={2} direction={'column'}>
            <Grid item>
              <EndpointChooser/>
            </Grid>
            <Grid item>
              <AuthorityConfigForm/>
            </Grid>
            <Grid item>
              <FeatureForm/>
            </Grid>
            <Grid item>
              <OpenAISettingsForm/>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {<Button autoFocus onClick={handleClose}>
            schließen und neu laden
          </Button>}
        </DialogActions>
      </Dialog>

  )
}

export default SettingsModal
