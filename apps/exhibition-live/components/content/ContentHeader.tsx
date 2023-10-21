import Link from 'next/link'
import React, { FunctionComponent } from 'react'

interface OwnProps {}

type Props = OwnProps;

const ContentHeader: FunctionComponent<Props> = (props) =>
    (
        <div className="content-header">
          <div className="container">
            <nav className="breadcrumb">
              <ol>
                <li>
                  <Link href="/" title="Startseite">
                    Startseite
                  </Link>
                </li>
                <li>
                  <Link
                      href="/exhibition"
                      title="Veranstaltung"
                  >
                    Ausstellung
                  </Link>
                </li>
              </ol>
            </nav>
            <h1>Ausstellung</h1>
            <button className="content-search-toggle" type="button">
              <span className="sr-only">Suche öffnen</span>
            </button>
            <form
                id="content-search-form"
                action="https://performance.musiconn.de/event?tx_mpeext_eventplugin%5Bcontroller%5D=Event&cHash=6b0be78c0503ebc67a0933c0040800ab"
                method="post"
            >
              <div>
                <input
                    type="hidden"
                    name="tx_mpeext_eventplugin[__referrer][@extension]"
                    defaultValue=""
                />
                <input
                    type="hidden"
                    name="tx_mpeext_eventplugin[__referrer][@controller]"
                    defaultValue="Standard"
                />
                <input
                    type="hidden"
                    name="tx_mpeext_eventplugin[__referrer][@action]"
                    defaultValue="default"
                />
                <input
                    type="hidden"
                    name="tx_mpeext_eventplugin[__referrer][arguments]"
                    defaultValue="YTowOnt96c63755d291d785ea055b1adf8857dd04bcca44b"
                />
                <input
                    type="hidden"
                    name="tx_mpeext_eventplugin[__referrer][@request]"
                    defaultValue='{"@extension":null,"@controller":"Standard","@action":"default"}e6b68a6c0c2b6a316e9542a5f36fe1f9bf095a4f'
                />
                <input
                    type="hidden"
                    name="tx_mpeext_eventplugin[__trustedProperties]"
                    defaultValue='{"quickSearch":1}44589eadd100880923713e59da018dd16f50ce22'
                />
              </div>
            </form>
          </div>
        </div>
    )

export default ContentHeader
