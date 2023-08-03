import { Settings } from '@mui/icons-material'
import {Button, Grid} from '@mui/material'
import React, {FunctionComponent} from 'react'

import SettingsModal from '../content/settings/SettingsModal'
import {useLocalSettings} from '../state/useLocalSettings'

interface OwnProps {
}

type Props = OwnProps;

const Logo = () => (<img src={  './logo.png'} alt="Ausstellungsdatenbank" width="150"/>)
const PerformanceHeader: FunctionComponent<Props> = (props) => {
  const {openSettings} = useLocalSettings()
  return (
      <>
      <header className="page-header">
        <Grid container justifyContent={'center'}>
          <Grid item>
          {/* Header logo */}
          <div className="brand">
            <a
                className="logo"
                title="zur Homepage"
                href="#"
            >
              <Logo />
            </a>
          </div>
          </Grid>
          {/* Main navigation */}
         <Grid  item>
                <Button startIcon={<Settings />} onClick={openSettings} >
                  Einstellungen
                </Button>
         </Grid>
        </Grid>
      </header>
      <SettingsModal />
</>
)
}

export default PerformanceHeader
