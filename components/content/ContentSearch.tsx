import {literal, variable} from '@rdfjs/data-model'
import namespace from '@rdfjs/namespace'
import {rdfs} from '@tpluscode/rdf-ns-builders'
import {SELECT} from '@tpluscode/sparql-builder'
import type Yasgui from '@triply/yasgui'
import dayjs from 'dayjs'
import moment from 'moment'
import React, {FormEvent, FunctionComponent, useCallback, useEffect, useState} from 'react'

import {BASE_IRI} from '../config'
import {useExhibitionData} from '../exhibtion/useExhibitionData'
import {ColumnRaw} from '../lists/datagrid/columnRaw'
import DeclarativeDataGrid from '../lists/DeclarativeDatagrid'
import {useOxigraph} from '../state'
import SPARQLToolkit from '../utils/dev/SPARQLToolkit'
import {rdfLiteralToNative} from '../utils/primitives'
//TODO get rid of moment js in favor of dayjs
global.moment = moment

interface OwnProps {
}

type Props = OwnProps;

interface Term {
  type: 'uri' | 'literal'
  value: string
}

interface NamedNode extends Term {
  type: 'uri',
  value: string
}

interface Literal extends Term {
  type: 'literal'
  value: string
  datatype?: string
  language?: string
}


const isLiteral = (t: Term): t is Literal => t.type === 'literal'
const isNamedNode = (t: Term): t is NamedNode => t.type === 'uri'

type Binding = {
  [k: string]: NamedNode | Literal
}

type SparqlBindings = {
  head: {
    vars: string[]
  }
  results: {
    bindings: Binding[]
  }
}

const sladb = namespace(BASE_IRI)
const slmeta = namespace('http://ontologies.slub-dresden.de/meta#')

const checkDate = (v: any) => (v instanceof Date) ? dayjs(v).toJSON() : v
type ClassCount = { clazz?: string, clazzLabel?: string, count?: string }

const ContentSearch: FunctionComponent<Props> = (props) => {
  const [complexEnabled, setComplexEnabled] = useState(false)
  const [searchString, setSearchString] = useState('')
  const {bulkLoaded, bulkLoading} = useExhibitionData()
  const {oxigraph} = useOxigraph()
  const [bindingResults, setBindingResults] = useState<Binding[] | null>(null)
  const [tableData, setTableData] = useState<any[]>([])
  const [columnRawDefinition, setColumnRawDefinition] = useState<ColumnRaw[] | null>(null)

  const [yasgui, setYasgui] = useState<Yasgui | null>(null)

  const handleComplexSearchToggle = useCallback(
      () => {
        setComplexEnabled(e => !e)
      },
      [setComplexEnabled])


  const [classCount, setClassCount] = useState<ClassCount[]>([])


  useEffect(() => {
    console.log('ping')
    if (!oxigraph || !bulkLoaded) return
    /**
     * For each owl:Class within the database count all instances
     * and return the result as a table
     *
     **/
    const count = variable('count '),
        clazz = variable('clazz '),
        clazzLabel = variable('clazzLabel '),
        innerSelect =
            SELECT`${clazz} (COUNT(?entity) AS ${count}) `.WHERE`
                ?entity a ${clazz} .
            `.GROUP().BY(clazz)
                .LIMIT(1000),
        selectQuery =
            SELECT`${clazz} ${clazzLabel} ${count} `.WHERE`
              ${clazz} ${rdfs.label} ${clazzLabel} .
              { ${innerSelect} }
            `.LIMIT(1000)

    oxigraph.query(selectQuery.build())
        .then(result => {
          if (!Array.isArray(result?.data?.results?.bindings)) return
          const bindings: SparqlBindings = result.data
          setClassCount(
              bindings.results.bindings.map(b => ({
                clazz: b.clazz?.value,
                clazzLabel: b.clazzLabel?.value,
                count: b.count?.value,
              }))
          )
        })
  }, [oxigraph, setClassCount, bulkLoaded])

  const handleSparqlQuery = useCallback(
      async () => {
        if (!yasgui) return
        // @ts-ignore
        const yasqe = yasgui.getTab(0)?.getYasqe()
        // @ts-ignore
        const yasr = yasgui.getTab(0)?.getYasr()
        const query = yasqe?.getValueWithoutComments()
        if (!oxigraph || !query) return
        const response = (await oxigraph.query(query))
        console.log({response, yasr})
        yasr?.setResponse(response)
      },
      [yasgui, oxigraph],
  )


  const handleSearch = useCallback(
      async (e: Event | FormEvent) => {
        e.preventDefault()
        //TODO this part needs to be way more dynamic (based on schema or directly from ontology)
        const id = variable('id'),
            title = variable('title'),
            notes = variable('notes'),
            location = variable('location'),
            created = variable('created')
        const sparqlQuery =
            SELECT.DISTINCT`${id} ${title} ${notes} ${location} ${created}`
                .WHERE` 
                ${id} a ${sladb.Exhibition} ;
                  ${sladb.title} ${title} .
                  OPTIONAL { ${id} ${sladb.notes} ${notes} } .
                  OPTIONAL { ${id} ${sladb.location} ${location} } .
                  OPTIONAL { ${id} ${slmeta.created} ${created}  } .
                  ${searchString && searchString.length > 0 && `
                    FILTER( CONTAINS(STR(?${title.value}), "${searchString}" ) )
                  `}`
                .LIMIT(100)
        if (!oxigraph) return
        const bindings: SparqlBindings = (await oxigraph.query(sparqlQuery.build())).data

        const table = bindings.results.bindings.map(binding =>
            Object.fromEntries(
                Object.entries(binding).map(([k, v]) => {
                  const val = isLiteral(v)
                      ? checkDate(rdfLiteralToNative(literal(v.value, v.datatype || v.language)))
                      : v.value
                  return [k, val]
                })))


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
                'name': 'notes',
                'header': 'notes',
                'type': 'string'
              },
              {
                'name': 'location',
                'header': 'location',
                'type': 'string'
              },
              {
                'name': 'created',
                'header': 'created',
                'type': 'date'
              }
            ]
        )
        setBindingResults(bindings.results.bindings)
        setTableData(table)
        //setBindingResults(await bindings.toArray())


      },
      [searchString, oxigraph, setBindingResults, setTableData, setColumnRawDefinition])


  return (
      <div className="container">
        <SPARQLToolkit onInit={yg => setYasgui(yg)} onSendClicked={handleSparqlQuery}/>
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
                        value={searchString}
                        onChange={e => setSearchString(e.target.value)}

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
                {
                  classCount.map(({clazz, clazzLabel, count}) => <li>
                      <a
                          key={clazz}
                          href={`/search?clazz=${clazzLabel}`}
                          className="series"
                      >
                        {clazzLabel}<span className="result-count">{count}</span>
                      </a>
                    </li>

                  )
                }
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
            {bindingResults && columnRawDefinition &&
                <DeclarativeDataGrid
                    columnsRaw={columnRawDefinition}
                    debugEnabled={true}
                    data={tableData}/>
            }
          </div>
        </div>
      </div>

  )
}

export default ContentSearch
