import { Settings } from '@mui/icons-material'
import {Button} from '@mui/material'
import React, {FunctionComponent} from 'react'

import SettingsModal from '../content/settings/SettingsModal'
import {useLocalSettings} from '../state/useLocalSettings'

interface OwnProps {
}

type Props = OwnProps;

const PerformanceHeader: FunctionComponent<Props> = (props) => {
  const {openSettings} = useLocalSettings()
  return (
      <>
      <header className="page-header">
        <div className="container">
          {/* Header logo */}
          <div className="brand">
            <a
                className="logo"
                title="zur Homepage"
                href="https://performance.musiconn.de/"
            >
              exhibition.performance — Das Eingabe- und Recherchetool für die
              Kunstwissenschaft
            </a>
          </div>
          {/* Main navigation */}
          <nav className="main-navigation">
            <ul className="navigation-list">
              <li>
                <Button startIcon={<Settings />} onClick={openSettings} >
                  Einstellungen
                </Button>
              </li>
            </ul>
          </nav>
          {/* Navigation toggle for mobile navigation */}
          <button className="navigation-toggle" type="button">
            <span className="sr-only">Menü öffnen</span>
            <span className="icon-bar"/>
            <span className="icon-bar"/>
            <span className="icon-bar"/>
          </button>
        </div>
        {/* Login toggle to activate overlay login modal */}
        <div className="login-toggle">
          <button className="login-toggle-button" type="button">
            <span className="sr-only">Login anzeigen</span>
          </button>
        </div>
      </header>
      <SettingsModal />
</>
)
}

export default PerformanceHeader
