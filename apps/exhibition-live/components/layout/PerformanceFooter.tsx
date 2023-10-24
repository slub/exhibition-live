import React, { FunctionComponent } from "react";

interface OwnProps {}

type Props = OwnProps;

const PerformanceFooter: FunctionComponent<Props> = (props) => (
  <footer className="page-footer">
    <div className="container">
      {/* Footer navigation */}
      <nav>
        <ul className="footer-navigation">
          <li>
            <a
              href="https://www.slub-dresden.de/"
              title="Sächsische Landesbibliothek – Staats- und Universitätsbibliothek Dresden"
            >
              SLUB Dresden
            </a>
          </li>
          <li>
            <a href="https://www.musiconn.de/" title="musiconn">
              musiconn
            </a>
          </li>
          <li>
            <a href="https://performance.musiconn.de/legal" title="Impressum">
              Impressum
            </a>
          </li>
          <li>
            <a
              href="https://performance.musiconn.de/privacy"
              title="Datenschutzerklärung"
            >
              Datenschutzerklärung
            </a>
          </li>
          <li>
            <a href="https://performance.musiconn.de/contact" title="Kontakt">
              Kontakt
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </footer>
);

export default PerformanceFooter;
