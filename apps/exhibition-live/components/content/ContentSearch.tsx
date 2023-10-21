import namespace from '@rdfjs/namespace'
import dayjs from 'dayjs'
import moment from 'moment'
import React, {FormEvent, FunctionComponent, useCallback, useEffect, useState} from 'react'

import {BASE_IRI} from '../config'
import {ColumnRaw} from '../lists/datagrid/columnRaw'
import DeclarativeDataGrid from '../lists/DeclarativeDatagrid'
import {useSearchExhibitionsQuery} from '../types/graphql'
//TODO get rid of moment js in favor of dayjs
global.moment = moment

interface OwnProps {
}

type Props = OwnProps;

const ContentSearch: FunctionComponent<Props> = (props) => {
    const [complexEnabled, setComplexEnabled] = useState(false)
    const [searchString, setSearchString] = useState<string | null>(null)
    const [columnRawDefinition, setColumnRawDefinition] = useState<ColumnRaw[]>([
            {
                'name': 'id',
                'header': 'id',
                'type': 'string'
            },
            {
                'name': 'title',
                'header': 'title',
                'type': 'string'
            },
            {
                'name': 'description',
                'header': 'Beschreibung',
                'type': 'string'
            },
            {
                'name': 'fromDate',
                'header': 'von',
                'type': 'date'
            },
            {
                'name': 'toDate',
                'header': 'bis',
                'type': 'date'
            }
        ])

    const { data: exhibitionsData } = useSearchExhibitionsQuery({searchString}, { enabled: searchString !== null })
    const tableData = exhibitionsData?.getExhibitions

    useEffect(() => {
        setSearchString('')
    }, [setSearchString])


    const handleComplexSearchToggle = useCallback(
        () => {
            setComplexEnabled(e => !e)
        },
        [setComplexEnabled])


    const handleSearch = useCallback(
        async (e: Event | FormEvent) => {

            setColumnRawDefinition(
                [
                    {
                        'name': 'id',
                        'header': 'id',
                        'type': 'string'
                    },
                    {
                        'name': 'title',
                        'header': 'title',
                        'type': 'string'
                    },
                    {
                        'name': 'description',
                        'header': 'Beschreibung',
                        'type': 'string'
                    },
                    {
                        'name': 'fromDate',
                        'header': 'von',
                        'type': 'date'
                    },
                    {
                        'name': 'toDate',
                        'header': 'bis',
                        'type': 'date'
                    }
                ]
            )
            //setTableData(table)


        },
        [searchString, setColumnRawDefinition])


    return (
        <div className="container">
            <div id="c195" className="colName-text colPos-0 text text">
                <p>
                    Nähere Informationen zu Inhalten von musiconn.performance und zu
                    Funktionen und Ergebnissen der Suche erhalten Sie{' '}
                    <a
                        href="https://test.performance.slub-dresden.de/default-title-7/zur-suche-und-ihren-ergebnissen"
                        target="_blank"
                        rel="noreferrer"
                    >
                        hier
                    </a>
                    .
                </p>
            </div>
            <div id="c220" className="colName-form colPos-1 form list">
                <div className="simple-form active">
                    <form
                        id="content-search-form"
                        onSubmit={handleSearch}
                    >
                        <div className="typeahead__container">
                            <div className="typeahead__field">
                                <div className="typeahead__query">
                                    <label className="search-label" htmlFor="input-text">
                                        Suche
                                    </label>
                                    <div
                                        className="autocomplete-selection"
                                        style={{height: '48.7444px', left: 60, maxWidth: 350}}
                                    />
                                    <span className="typeahead__cancel-button">×</span>
                                    <input
                                        id="input-text"
                                        className="search-text js-typeahead autocomplete"
                                        defaultValue=""
                                        name="fulltext"
                                        autoComplete="off"
                                        placeholder="Suche"
                                        data-entities="series|location|corporation|person|work|source"
                                        data-max={500}
                                        data-show={8}
                                        style={{paddingLeft: 60}}
                                        value={searchString || ''}
                                        onChange={e =>
                                            setSearchString(e.target.value)}

                                    />
                                    <input type="hidden" defaultValue={25} name="max"/>
                                    <input type="hidden" defaultValue="event" name="entityType"/>
                                </div>
                            </div>
                        </div>
                        <select name="project">
                            <option selected value=""></option>
                            <option value={3}>
                                Carl Philipp Emanuel Bachs Konzerte in Hamburg
                            </option>
                            <option value={7}>Fanny Hensels Sonntagsmusiken</option>
                            <option value={13}>Internationalisierung der Symphonik</option>
                            <option value={12}>Musica Migrans</option>
                            <option value={2}>Dresdner Kreuzchor</option>
                            <option value={4}>Dresdner Philharmonie</option>
                            <option value={1}>Staatsoper Dresden</option>
                            <option value={6}>Fachinformationsdienst Musikwissenschaft</option>
                            <option value={19}>Ritualdesign für die Ballettbühne</option>
                            <option value={10}>
                                Repertoireforschung zum Leipziger Thomanerchor
                            </option>
                            <option value={5}>Frankfurter Museumsgesellschaft</option>
                            <option value={8}>Jenaer Konzerte - Programme und Plakate</option>
                            <option value={16}>Sammlung Bialik (HMTM Hannover)</option>
                            <option value={20}>Lortzing-Gesellschaft</option>
                            <option value={18}>
                                Uraufführungen von Werken in und aus der DDR (1976-1990)
                            </option>
                            <option value={11}>Leipziger Synagogalchor</option>
                            <option value={21}>
                                {/* eslint-disable-next-line react/no-unescaped-entities */}
                                Die Erstaufführungen des 'Verdi-Requiems' im deutschsprachigen Raum
                            </option>
                            <option value={22}>Sinfonische Konzerte in Tokyo</option>
                            <option value={17}>Sammlungen der SLUB Dresden</option>
                            <option value={25}>Oper in Berlin 1810–1830</option>
                            <option value={15}>
                                Konzertprogramme des Leipziger Konservatoriums für Musik
                            </option>
                        </select>
                        <button
                            className="search-button"
                            id="search-button"
                            type="submit"
                            name=""
                            value=""
                            onClick={handleSearch}
                        >
                            suchen
                        </button>
                    </form>
                    <div className="facets-toggle"/>
                </div>
                <div className={`complex-form hidden ${complexEnabled ? 'active' : ''}`}>
                </div>
                <div className="form-switch-container">
                    <div className={`form-switch ${complexEnabled ? 'complex' : 'simple'}-active`}
                         onClick={handleComplexSearchToggle}>
                        <span className="switch-label simple-search">Einfache Suche</span>
                        <span className="switch-indicator"/>
                        <span className="switch-label complex-search">Profi-Suche</span>
                    </div>
                </div>
            </div>
            <div id="c221" className="colName-tabs colPos-2 tabs list">
                <div className="view-selection">
                    <nav className="search-navigation">
                        <ul className="view-tabs">
                            <li>
                                <a
                                    href="https://performance.musiconn.de/search/series?max=25&sort=1%7C1%7C1%7C1%7C1%7C1%7C1&cHash=4b0986aeaeba449d98a9184ce9e1cdf9"
                                    className="series"
                                >
                                    Ausstellungsserien<span className="result-count">643</span>
                                </a>
                            </li>
                            <li className="active">
                                <a href="https://performance.musiconn.de/search#" className="event">
                                    Ausstellungen<span className="result-count">59729</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://performance.musiconn.de/search/location?max=25&sort=1%7C1%7C1%7C1%7C1%7C1%7C1&cHash=205f0b2e527867ab7751ca016e07114e"
                                    className="location"
                                >
                                    Orte<span className="result-count">4471</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://performance.musiconn.de/search/person?max=25&sort=1%7C1%7C1%7C1%7C1%7C1%7C1&cHash=41b45897415f8509abceb5c3989abc50"
                                    className="person"
                                >
                                    Künstler*innen<span className="result-count">16948</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://performance.musiconn.de/search/corporation?max=25&sort=1%7C1%7C1%7C1%7C1%7C1%7C1&cHash=ae741758082f0929eb3c9310735d7352"
                                    className="corporation"
                                >
                                    Körperschaften<span className="result-count">2593</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://performance.musiconn.de/search/work?max=25&sort=1%7C1%7C1%7C1%7C1%7C1%7C1&cHash=9ada96025b5ef6e65e2560ce8563c338"
                                    className="work"
                                >
                                    Werke<span className="result-count">34595</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                    <div className="mobile-view-toggle-back"/>
                    <div className="mobile-view-toggle">
                        <a href="https://performance.musiconn.de/search#" className="event">
                            Ausstellungen<span className="result-count">59729</span>
                        </a>
                    </div>
                </div>
            </div>
            <div id="c222" className="colName-pages colPos-3 pages list">
                <div className="result-pagination">
                    <div className="result-control">
                        <div className="search-result-status">
          <span className="search-control-label">
            <strong>59729</strong> Veranstaltungen sortiert nach
          </span>
                            <form id="sort">
                                <input type="hidden" name="max" defaultValue={25}/>
                                <select
                                    className="searchresult-dropdown search-sort-type"
                                    name="sort"
                                >
                                    {' '}
                                    <option value="1|1|1|1|1|1|1" selected>
                                        Relevanz
                                    </option>
                                    {' '}
                                    <option value="1|2|1|1|1|1|1">
                                        Veranstaltungstitel (alphabetisch: a-z)
                                    </option>
                                    {' '}
                                    <option value="1|3|1|1|1|1|1">
                                        Veranstaltungstitel (alphabetisch: z-a)
                                    </option>
                                    {' '}
                                    <option value="1|4|1|1|1|1|1">
                                        Veranstaltungsdatum (aufsteigend)
                                    </option>
                                    {' '}
                                    <option value="1|5|1|1|1|1|1">
                                        Veranstaltungsdatum (absteigend)
                                    </option>
                                    {' '}
                                    <option value="1|6|1|1|1|1|1">Eingabedatum (aufsteigend)</option>
                                    {' '}
                                    <option value="1|7|1|1|1|1|1">Eingabedatum (absteigend)</option>
                                </select>
                                <button className="hidden-button send-form" type="submit">
                                    Senden
                                </button>
                            </form>
                            <div className="selected-option">Relevanz</div>
                        </div>
                        <div className="search-result-max">
                            <form id="max-options">
                                <select className="searchresult-dropdown max-options" name="max">
                                    {' '}
                                    <option value={1}>1</option>
                                    <option value={10}>10</option>
                                    {' '}
                                    <option value={25} selected>
                                        25
                                    </option>
                                    {' '}
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span className="search-control-label"> Ergebnisse pro Seite</span>
                                <input type="hidden" name="sort" defaultValue="1|1|1|1|1|1|1"/>
                                <button
                                    className="hidden-button send-form"
                                    type="submit"
                                    name=""
                                    value=""
                                >
                                    Senden
                                </button>
                            </form>
                        </div>
                        <div className="result-pagination">
                            <span className="pagination-back disabled">←</span>
                            <span className="pagination-status">
            Seite{' '}
                                <span className="search-page-jumper">
              1
              <form
                  id="page-jumper"
                  action="https://performance.musiconn.de/search/event"
              >
                {' '}
                  <input type="hidden" name="sort" defaultValue="1|1|1|1|1|1|1"/>
                <input type="hidden" name="page" defaultValue="1|1|1|1|1|1|1"/>
                <input type="hidden" name="max" defaultValue={25}/>{' '}
                  <label htmlFor="page-jumper-value">Springe zur Seite</label>
                <input
                    id="page-jumper-value"
                    type="text"
                    name={'1'}
                    defaultValue={1}
                />{' '}
                  <button type="submit">Jetzt!</button>
              </form>
            </span>{' '}
                                von 2390
          </span>
                            <a
                                className="pagination-next"
                                title="vor"
                                href="https://performance.musiconn.de/search/event?max=25&page=1%7C2%7C1%7C1%7C1%7C1%7C1&sort=1%7C1%7C1%7C1%7C1%7C1%7C1&cHash=55b6f7796b949fac25752fce3cb74141"
                            >
                                →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div id="c223" className="colName-result colPos-4 result list">
                <div className="result-list" style={{height: '1000px'}}>
                    {columnRawDefinition &&
                        <DeclarativeDataGrid
                            columnsRaw={columnRawDefinition}
                            debugEnabled={true}
                            data={tableData || []}/>
                    }
                </div>
            </div>
        </div>

    )
}

export default ContentSearch
