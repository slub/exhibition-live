import dayjs from 'dayjs'
import Link from 'next/link'
import React, {FunctionComponent} from 'react'


interface OwnProps {
  exhibition: any
  classIRI: string
}

type Props = OwnProps;


const format = (date?: string) => {
  return date ? dayjs(date.substring(1)).format('LL') : ''
}

const Person = ({person}: {person: any}) => {
  return (
    <dd className="persons">
      <Link href="#">
        {person.name || ''} {format(person.birth_date)} {person.death_date ? `- ${format(person.death_date)}` : ''}
      </Link>
    </dd>
  )
}

const ContentMain: FunctionComponent<Props> = ({exhibition}: Props) => {

  if (!exhibition) return null


  return (<>

        <div className="content-header">
          <div className="container">
            <nav className="breadcrumb">
              <ol>
                <li>
                  <Link href="https://performance.musiconn.de/" title="Startseite">
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
          </div>
        </div>
      <div className="content">
        <div className="container">
          <div id="c4" className="colName-standard colPos-0 standard list">
            <dl>
              <dl>
                <dt id="event_44711_categories" className="label-categories">
                  Kategorie
                </dt>
                <dd className="categories">
                  <span className="additional-inline">{exhibition?.type || 'Kunstausstellung'}</span>
                </dd>
                <dt id="event_44711_title" className="label-title">
                  Titel
                </dt>
                <dd className="title">
                  {exhibition?.title || ''}
                  <span className="additional-block">{format(exhibition?.start_date?.date)} - {format(exhibition?.end_date?.date)} </span>
                </dd>
                <dt id="event_44711_locations" className="label-locations">
                  Ort
                </dt>
                <dd className="locations">
                  <Link href="https://performance.musiconn.de/location/alte-buchhaendlerboerse-leipzig">
                    {exhibition?.place2}
                  </Link>
                  →{' '}
                  <Link
                      href="https://performance.musiconn.de/location/leipzig"
                      title="Leipzig"
                  >
                    {exhibition?.place1}
                  </Link>
                  →{' '}
                  <Link
                      href="https://performance.musiconn.de/location/sachsen"
                      title="Sachsen"
                  >
                    Sachsen
                  </Link>
                  →{' '}
                  <Link
                      href="https://performance.musiconn.de/location/deutschland"
                      title="Deutschland"
                  >
                    Deutschland
                  </Link>
                  →{' '}
                  <Link
                      href="https://performance.musiconn.de/location/europa"
                      title="Europa"
                  >
                    Europa
                  </Link>
                </dd>
                <dt id="event_44711_serials" className="label-serials">
                  Kunstausstellung
                </dt>
                <dt id="event_44711_corporations" className="label-corporations">
                  Beteiligte Körperschaften
                </dt>
                <dd className="corporations">
                </dd>
                <dt id="event_44711_persons" className="label-persons">
                  Kurator
                </dt>
                {!Array.isArray(exhibition.curator)
                    ? null : exhibition.curator.map((person: any) => <Person key={person['@id'] || ''} person={person} />)}

                <dt id="event_44711_persons" className="label-persons">
                  Beteiligte Künstlerinnen und Künstler
                </dt>
                {!Array.isArray(exhibition.artist)
                    ? null : exhibition.artist.map((person: any) => <Person key={person['@id'] || ''} person={person} />)}

                <dt id="event_44711_performances" className="label-program">
                  Programm
                </dt>
                <dt id="event_44711_sources" className="label-sources">
                  Quellen
                </dt>
                <dd className="sources" id="event_44711_sources_150">
                  <Link href="https://performance.musiconn.de/source/neue-zeitschrift-fuer-musik-nzfm">
                    Neue Zeitschrift für Musik (NZfM)
                  </Link>
                  <span className="additional-inline"> (1872, S. 59f.)</span>
                </dd>
                <dd className="sources" id="event_44711_sources_240">
                  <Link href="https://performance.musiconn.de/source/programmzettel-113">
                    Programmzettel
                  </Link>
                </dd>
                <dd className="sources" id="event_44711_sources_3947">
                  <Link href="https://performance.musiconn.de/source/stadtbibliothek-leipzig">
                    Stadtbibliothek Leipzig
                  </Link>
                  <span className="additional-inline">
                  {' '}
                    (
                  <Link
                      href="https://digital.slub-dresden.de/id507696093"
                      title="https://digital.slub-dresden.de/id507696093"
                      target="_blank"
                      rel="noreferrer"
                  >
                    https://digital.slub-dresden.de/id507696093
                  </Link>
                  )
                </span>
                  <span className="additional-block">
                  Voransicht externes Digitalisat{' '}
                    <span className="additional-inline">(795)</span>
                </span>
                  <span className="result-pagination">
                  <span className="result-control">
                    <span className="result-pagination">
                      <span className="pagination-back disabled">←</span>
                      <span className="pagination-status">
                        Seite 1 von 53 Seiten
                      </span>
                      <span className="pagination-next">
                        <Link
                            href="https://performance.musiconn.de/event/id/44711?tx_mpeext_eventplugin%5Bpage%5D%5Bevent_44711_sources_3947%5D=2&cHash=7507e719beff129b918ffecf69e00c81"
                            title="vor"
                            data-next="/event/id/44711?plain=true&props=uid%7Csources&tx_mpeext_eventplugin%5Bpage%5D%5Bevent_44711_sources_3947%5D=2&cHash=4416f3d06e6b6da882b30822d9cfa074"
                        >
                          →
                        </Link>
                      </span>
                    </span>
                  </span>
                </span>
                </dd>
                <dt id="event_44711_projects" className="label-projects">
                  Projekte
                </dt>
                <dd className="projects">
                  <Link href="https://performance.musiconn.de/projects/internationalisierung-der-symphonik">
                    Internationalisierung der Symphonik
                  </Link>
                </dd>
              </dl>
            </dl>
          </div>
        </div>
      </div>
      </>
  )
}

export default ContentMain
