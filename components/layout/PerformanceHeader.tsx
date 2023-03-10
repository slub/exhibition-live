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
            <ul className="primary-navigation">
              <li className="submenu ">
                <a href="https://performance.musiconn.de/search" title="Recherche">
                  Recherche
                </a>
                <ul>
                  <li>
                    <a
                        href="https://performance.musiconn.de/default-title-7/zur-suche-und-ihren-ergebnissen"
                        title="Datengrundlage und Suche"
                    >
                      Datengrundlage und Suche
                    </a>
                  </li>
                </ul>
              </li>
              <li className="submenu ">
                <a
                    href="https://performance.musiconn.de/projects"
                    title="Alle Projekte"
                >
                  Projekte
                </a>
                <ul>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/carl-philipp-emanuel-bachs-konzerte-in-hamburg"
                        title="Carl Philipp Emanuel Bachs Konzerte in Hamburg"
                    >
                      Carl Philipp Emanuel Bachs Konzerte in Hamburg
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/dresdner-kreuzchor"
                        title="Dresdner Kreuzchor"
                    >
                      Dresdner Kreuzchor
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/dresdner-philharmonie"
                        title="Dresdner Philharmonie"
                    >
                      Dresdner Philharmonie
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/die-erstauffuehrungen-des-verdi-requiems-im-deutschsprachigen-raum"
                        title="Die Erstaufführungen des 'Verdi-Requiems' im deutschsprachigen Raum"
                    >
                      Die Erstaufführungen des &apos;Verdi-Requiems&apos; im deutschsprachigen
                      Raum
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/fachinformationsdienst-musikwissenschaft"
                        title="Fachinformationsdienst Musikwissenschaft"
                    >
                      Fachinformationsdienst Musikwissenschaft
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/fanny-hensels-sonntagsmusiken"
                        title="Fanny Hensels Sonntagsmusiken"
                    >
                      Fanny Hensels Sonntagsmusiken
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/frankfurter-museumsgesellschaft"
                        title="Frankfurter Museumsgesellschaft"
                    >
                      Frankfurter Museumsgesellschaft
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/internationalisierung-der-symphonik"
                        title="Internationalisierung der Symphonik"
                    >
                      Internationalisierung der Symphonik
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/jenaer-konzerte-programme-und-plakate"
                        title="Jenaer Konzerte - Programme und Plakate"
                    >
                      Jenaer Konzerte - Programme und Plakate
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/konzertprogramme-des-leipziger-konservatoriums-fuer-musik"
                        title="Konzertprogramme des Leipziger Konservatoriums für Musik"
                    >
                      Konzertprogramme des Leipziger Konservatoriums für Musik
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/leipziger-synagogalchor"
                        title="Leipziger Synagogalchor"
                    >
                      Leipziger Synagogalchor
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/lortzing-gesellschaft"
                        title="Lortzing-Gesellschaft"
                    >
                      Lortzing-Gesellschaft
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/musica-migrans"
                        title="Musica Migrans"
                    >
                      Musica Migrans
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/oper-in-berlin-1810-1830"
                        title="Oper in Berlin 1810–1830"
                    >
                      Oper in Berlin 1810–1830
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/repertoireforschung-zum-leipziger-thomanerchor"
                        title="Repertoireforschung zum Leipziger Thomanerchor"
                    >
                      Repertoireforschung zum Leipziger Thomanerchor
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/ritualdesign-fuer-die-ballettbuehne"
                        title="Ritualdesign für die Ballettbühne"
                    >
                      Ritualdesign für die Ballettbühne
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/sammlung-bialik-hmtm-hannover"
                        title="Sammlung Bialik (HMTM Hannover)"
                    >
                      Sammlung Bialik (HMTM Hannover)
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/sammlungen-der-slub-dresden"
                        title="Sammlungen der SLUB Dresden"
                    >
                      Sammlungen der SLUB Dresden
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/concert-life-and-concert-venues-in-tokyo"
                        title="Sinfonische Konzerte in Tokyo"
                    >
                      Sinfonische Konzerte in Tokyo
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/staatsoper-dresden"
                        title="Staatsoper Dresden"
                    >
                      Staatsoper Dresden
                    </a>
                  </li>
                  <li>
                    <a
                        href="https://performance.musiconn.de/projects/urauffuehrungen-der-ddr"
                        title="Uraufführungen von Werken in und aus der DDR (1976-1990)"
                    >
                      Uraufführungen von Werken in und aus der DDR (1976-1990)
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                <a
                    href="https://performance.musiconn.de/collections"
                    title="Sammlungen"
                >
                  Sammlungen
                </a>
              </li>
              <li>
                <a
                    href="https://performance.musiconn.de/faq"
                    title="Frequently asked questions"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a href='#' onClick={openSettings} title="Einstellungen">
                  Einstellungen
                </a>
              </li>
              <li>
                <a href="https://performance.musiconn.de/about" title="Über uns">
                  Über uns
                </a>
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
