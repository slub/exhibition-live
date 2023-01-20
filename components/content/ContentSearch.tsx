import {literal, variable} from '@rdfjs/data-model'
import namespace from '@rdfjs/namespace'
import {SELECT} from '@tpluscode/sparql-builder'
import dayjs from 'dayjs'
import moment from 'moment'
import React, {FormEvent, FunctionComponent, useCallback, useState} from 'react'

import {BASE_IRI} from '../config'
import {useExhibitionData} from '../exhibtion/useExhibitionData'
import {ColumnRaw} from '../lists/datagrid/columnRaw'
import DeclarativeDataGrid from '../lists/DeclarativeDatagrid'
import {useOxigraph} from '../state'
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

const ContentSearch: FunctionComponent<Props> = (props) => {
  const [complexEnabled, setComplexEnabled] = useState(false)
  const [searchString, setSearchString] = useState('')
  const {bulkLoaded, bulkLoading} = useExhibitionData()
  const {oxigraph} = useOxigraph()
  const [bindingResults, setBindingResults] = useState<Binding[] | null>(null)
  const [tableData, setTableData] = useState<any[]>([])
  const [columnRawDefinition, setColumnRawDefinition] = useState<ColumnRaw[] | null>(null)

  const handleComplexSearchToggle = useCallback(
      () => {
        setComplexEnabled(e => !e)
      },
      [setComplexEnabled])

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
            <form
                id="complex-search-form"
                action="https://performance.musiconn.de/search/event"
            >
              <div className="form-row row-event">
                <strong className="row-label">Veranstaltung</strong>
                <div className="form-row-element">
                  <label htmlFor="event-searchword">Veranstaltungstitel</label>
                  <input
                      id="event-searchword"
                      type="text"
                      name="event"
                      defaultValue=""
                  />
                </div>
                <div
                    className="form-row-element inline-select"
                    style={{zIndex: 9000}}
                >
                  <label htmlFor="event-type">Typ</label>
                  <select name="eventcategory" id="event-type">
                    <option value="">--</option>
                    <option value={1}>Musiktheaterveranstaltung</option>
                    <option value={2}>Konzertveranstaltung</option>
                    <option value={3}>Religiöse Veranstaltung</option>
                    <option value={4}>Sonstige Veranstaltung</option>
                  </select>
                </div>
                <div className="form-row-element select-timespan">
                  <label htmlFor="event-time">Zeitraum</label>
                  <input
                      type="text"
                      name="eventdate"
                      defaultValue=""
                      id="event-time"
                      className="text-input datepicker"
                      placeholder="tt.mm.jjjj"
                  />
                </div>
              </div>
              <div className="form-row row-series">
                <strong className="row-label">Veranstaltungsreihe</strong>
                <div className="form-row-element">
                  <div className="typeahead__container">
                    <div className="typeahead__field">
                      <div className="typeahead__query">
                        <label className="search-label" htmlFor="series-searchword">
                          Reihentitel
                        </label>
                        <div
                            className="autocomplete-selection"
                            style={{height: '38.2481px', left: 10, maxWidth: 798}}
                        />
                        <span className="typeahead__cancel-button">×</span>
                        <input
                            id="series-searchword"
                            className="search-text js-typeahead autocomplete"
                            defaultValue=""
                            name="series"
                            autoComplete="off"
                            type="text"
                            data-entities="series"
                            data-max={300}
                            data-show={8}
                            style={{paddingLeft: 10}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-row row-location">
                <strong className="row-label">Veranstaltungsort</strong>
                <div className="form-row-element">
                  <div className="typeahead__container">
                    <div className="typeahead__field">
                      <div className="typeahead__query">
                        <label className="search-label" htmlFor="location-searchword">
                          Ort
                        </label>
                        <div
                            className="autocomplete-selection"
                            style={{height: '38.2481px', left: 10, maxWidth: 798}}
                        />
                        <span className="typeahead__cancel-button">×</span>
                        <input
                            id="location-searchword"
                            className="search-text js-typeahead autocomplete"
                            defaultValue=""
                            name="location"
                            autoComplete="off"
                            type="text"
                            data-entities="location"
                            data-max={300}
                            data-show={8}
                            style={{paddingLeft: 10}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-row row-person">
                <strong className="row-label">Interpret*innen</strong>
                <div className="form-row-element">
                  <div className="typeahead__container">
                    <div className="typeahead__field">
                      <div className="typeahead__query">
                        <label
                            className="search-label"
                            htmlFor="performer-searchword"
                        >
                          Name
                        </label>
                        <div
                            className="autocomplete-selection"
                            style={{height: '38.2481px', left: 10, maxWidth: 798}}
                        />
                        <span className="typeahead__cancel-button">×</span>
                        <input
                            id="performer-searchword"
                            className="search-text js-typeahead autocomplete"
                            defaultValue=""
                            name="performer"
                            autoComplete="off"
                            type="text"
                            data-entities="performer"
                            data-max={300}
                            data-show={8}
                            style={{paddingLeft: 10}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-row-element inline-select" style={{zIndex: 2}}>
                  <label htmlFor="person-activity">Beteiligt als / mit</label>
                  <select id="person-activity" name="personmedium">
                    <option value="">--</option>
                    <option value={649}>Akkordeon</option>
                    <option value={1229}>Aktion</option>
                    <option value={1164}>Alphorn</option>
                    <option value={33}>Alt (Stimmlage)</option>
                    <option value={850}>Altblockflöte</option>
                    <option value={828}>Altposaune</option>
                    <option value={1084}>Altquerflöte</option>
                    <option value={844}>Altsaxofon</option>
                    <option value={1156}>Audiotechnik</option>
                    <option value={907}>Ausführung (Musik)</option>
                    <option value={1170}>Ausstattung (Theater)</option>
                    <option value={1035}>Bajan</option>
                    <option value={1094}>Balalaika</option>
                    <option value={848}>Bandoneon</option>
                    <option value={1168}>Banjo</option>
                    <option value={339}>Bariton (Musikinstrument)</option>
                    <option value={7}>Bariton (Stimmlage)</option>
                    <option value={1167}>Baritonsaxofon</option>
                    <option value={1089}>Barockvioline</option>
                    <option value={814}>Baryton</option>
                    <option value={8}>Bass (Stimmlage)</option>
                    <option value={326}>Bassbariton (Stimmlage)</option>
                    <option value={712}>Bassetthorn</option>
                    <option value={534}>Bassettklarinette</option>
                    <option value={1325}>Bassgambe</option>
                    <option value={1033}>Bassgitarre</option>
                    <option value={423}>Bassinstrument</option>
                    <option value={520}>Bassklarinette</option>
                    <option value={78}>Basso continuo</option>
                    <option value={501}>Bassposaune</option>
                    <option value={1040}>Bassquerflöte</option>
                    <option value={856}>Becken (Musikinstrument)</option>
                    <option value={1225}>Blasharmonika</option>
                    <option value={211}>Blockflöte</option>
                    <option value={1276}>Bodypercussion</option>
                    <option value={976}>Bühnenbild</option>
                    <option value={527}>Celesta</option>
                    <option value={143}>Cembalo</option>
                    <option value={1012}>Choreografie</option>
                    <option value={118}>Chorleitung</option>
                    <option value={1192}>Computer</option>
                    <option value={657}>Countertenor (Stimmlage)</option>
                    <option value={946}>Darstellung (Musiktheater)</option>
                    <option value={698}>Deklamation</option>
                    <option value={85}>Dirigat</option>
                    <option value={550}>Diskantgambe</option>
                    <option value={1046}>Domra</option>
                    <option value={1217}>Dramaturgie</option>
                    <option value={477}>Einstudierung</option>
                    <option value={1226}>Einzeltanz</option>
                    <option value={994}>Elektrisches Klavier</option>
                    <option value={1022}>Elektrogitarre</option>
                    <option value={1205}>Elektronenorgel</option>
                    <option value={888}>Elektronik (Musik)</option>
                    <option value={1068}>Elektronische Geige</option>
                    <option value={1194}>Elektronische Steuerung</option>
                    <option value={1048}>Elektronisches Tasteninstrument</option>
                    <option value={533}>Englischhorn</option>
                    <option value={831}>Ensembleleitung</option>
                    <option value={112}>Fagott</option>
                    <option value={551}>Fidel</option>
                    <option value={133}>Flöte</option>
                    <option value={687}>Flügelhorn</option>
                    <option value={402}>Frauen-Singstimme</option>
                    <option value={440}>Gitarre</option>
                    <option value={882}>Glasharmonika</option>
                    <option value={1129}>Glasstabspiel</option>
                    <option value={1136}>Glocke</option>
                    <option value={944}>Hackbrett</option>
                    <option value={263}>Harfe</option>
                    <option value={316}>Harmonium</option>
                    <option value={164}>Horn (Musikinstrument)</option>
                    <option value={885}>Improvisation</option>
                    <option value={975}>Inszenierung</option>
                    <option value={1244}>Intendanz</option>
                    <option value={208}>Jagdhorn</option>
                    <option value={1186}>Jodeln</option>
                    <option value={1117}>Keyboard</option>
                    <option value={1223}>Klangmanipulation</option>
                    <option value={1211}>Klangrealisation</option>
                    <option value={1145}>Klangregie</option>
                    <option value={225}>Klarinette</option>
                    <option value={1315}>Klavichord</option>
                    <option value={94}>Klavier</option>
                    <option value={809}>Kleine Trommel</option>
                    <option value={261}>Knabenstimme</option>
                    <option value={702}>Kontra-Alt</option>
                    <option value={203}>Kontrabass</option>
                    <option value={1160}>Kontrabassblockflöte</option>
                    <option value={892}>Kontrabassklarinette</option>
                    <option value={709}>Kontrafagott</option>
                    <option value={1220}>Konzertina</option>
                    <option value={560}>Kornett</option>
                    <option value={476}>Korrepetition</option>
                    <option value={1213}>Kostümdesign</option>
                    <option value={1231}>Koto</option>
                    <option value={63}>Künstlerische Leitung</option>
                    <option value={306}>Laute</option>
                    <option value={494}>Leier</option>
                    <option value={1278}>Lichtdesign</option>
                    <option value={304}>Männer-Singstimme</option>
                    <option value={911}>Mandoline</option>
                    <option value={1082}>Marimba</option>
                    <option value={20}>Mezzosopran</option>
                    <option value={558}>Moderation</option>
                    <option value={71}>Musikinstrument</option>
                    <option value={940}>Musikproduktion</option>
                    <option value={106}>Oboe</option>
                    <option value={160}>Oboe da caccia</option>
                    <option value={159}>Oboe d'Amore</option>
                    <option value={853}>Ondes Martenot</option>
                    <option value={485}>Organisation</option>
                    <option value={73}>Orgel</option>
                    <option value={1104}>Panflöte</option>
                    <option value={964}>Pantomime</option>
                    <option value={186}>Pauke</option>
                    <option value={493}>Pikkoloflöte</option>
                    <option value={166}>Posaune</option>
                    <option value={537}>Positiv (Musikinstrument)</option>
                    <option value={1228}>Präparation</option>
                    <option value={1027}>Präpariertes Klavier</option>
                    <option value={237}>Querflöte</option>
                    <option value={937}>Sackpfeife</option>
                    <option value={1218}>Sampling (Musik)</option>
                    <option value={1207}>Santur</option>
                    <option value={826}>Saxofon</option>
                    <option value={54}>Schauspielkunst</option>
                    <option value={185}>Schlaginstrument</option>
                    <option value={887}>Schlagwerk (Musik)</option>
                    <option value={522}>Schlagzeug</option>
                    <option value={51}>Singstimme</option>
                    <option value={428}>Singstimme (hoch)</option>
                    <option value={155}>Singstimme (mittel)</option>
                    <option value={915}>Sitar</option>
                    <option value={350}>Solo (Musik)</option>
                    <option value={5}>Sopran</option>
                    <option value={572}>Sopranblockflöte</option>
                    <option value={600}>Sopraninstrument</option>
                    <option value={851}>Sopransaxofon</option>
                    <option value={1138}>Spieldose</option>
                    <option value={478}>Spielleitung</option>
                    <option value={1222}>Sprachmanipulation</option>
                    <option value={320}>Sprechstimme</option>
                    <option value={108}>Streichinstrument</option>
                    <option value={1049}>Synthesizer (Musikinstrument)</option>
                    <option value={69}>Tanz</option>
                    <option value={92}>Tasteninstrument</option>
                    <option value={1216}>technische Leitung</option>
                    <option value={6}>Tenor (Stimmlage)</option>
                    <option value={1044}>Tenorblockflöte</option>
                    <option value={685}>Tenorhorn</option>
                    <option value={568}>Tenorposaune</option>
                    <option value={1114}>Tenorsaxofon</option>
                    <option value={1266}>Theorbe</option>
                    <option value={616}>Thomaskantor</option>
                    <option value={588}>Triangel</option>
                    <option value={1204}>Tripelhorn</option>
                    <option value={747}>Trommel</option>
                    <option value={184}>Trompete</option>
                    <option value={226}>Tuba</option>
                    <option value={917}>Ud</option>
                    <option value={748}>Ventilhorn</option>
                    <option value={807}>Vibrafon</option>
                    <option value={110}>Viola</option>
                    <option value={949}>Viola alta</option>
                    <option value={242}>Viola da Gamba</option>
                    <option value={305}>Viola d'amore</option>
                    <option value={786}>Violin-Direktionsstimme</option>
                    <option value={109}>Violine</option>
                    <option value={491}>Violino piccolo</option>
                    <option value={137}>Violoncello</option>
                    <option value={204}>Violone</option>
                    <option value={919}>Violotta</option>
                    <option value={1041}>Volksmusikinstrument</option>
                    <option value={1201}>Wagnertuba</option>
                    <option value={948}>Waldhorn</option>
                    <option value={563}>Xylofon</option>
                    <option value={165}>Zink (Musikinstrument)</option>
                    <option value={492}>Zugtrompete</option>
                    <option value={262}>Zupfinstrument</option>
                    <option value={945}>Zymbal</option>
                  </select>
                </div>
              </div>
              <div className="form-row row-corporation">
                <strong className="row-label">Beteiligte Körperschaften</strong>
                <div className="form-row-element">
                  <div className="typeahead__container">
                    <div className="typeahead__field">
                      <div className="typeahead__query">
                        <label
                            className="search-label"
                            htmlFor="corporation-searchword"
                        >
                          Name
                        </label>
                        <div
                            className="autocomplete-selection"
                            style={{height: '38.2481px', left: 10, maxWidth: 798}}
                        />
                        <span className="typeahead__cancel-button">×</span>
                        <input
                            id="corporation-searchword"
                            className="search-text js-typeahead autocomplete"
                            defaultValue=""
                            name="corporation"
                            autoComplete="off"
                            type="text"
                            data-entities="corporation"
                            data-max={300}
                            data-show={8}
                            style={{paddingLeft: 10}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-row-element inline-select" style={{zIndex: 2}}>
                  <label htmlFor="corporation-activity">Beteiligt als / mit</label>
                  <select id="corporation-activity" name="corporationmedium">
                    <option value="">--</option>
                    <option value={988}>Akkordeonorchester</option>
                    <option value={907}>Ausführung (Musik)</option>
                    <option value={652}>Ballettkompanie</option>
                    <option value={874}>Big Band</option>
                    <option value={248}>Bläserensemble</option>
                    <option value={482}>Blaskapelle</option>
                    <option value={238}>Blasorchester</option>
                    <option value={191}>Blechbläser-Ensemble</option>
                    <option value={567}>Blockflöten-Ensemble</option>
                    <option value={61}>Chor</option>
                    <option value={411}>Duo</option>
                    <option value={888}>Elektronik (Musik)</option>
                    <option value={217}>Ensemble</option>
                    <option value={663}>Fanfare-Orchester</option>
                    <option value={1181}>Filmproduktion</option>
                    <option value={266}>Frauenchor</option>
                    <option value={60}>Gemischter Chor</option>
                    <option value={298}>Gesangsquartett</option>
                    <option value={532}>Holzbläserensemble</option>
                    <option value={218}>Instrumentalensemble</option>
                    <option value={879}>Jazzband</option>
                    <option value={686}>Jugendchor</option>
                    <option value={1132}>Kammerchor</option>
                    <option value={544}>Kammerorchester</option>
                    <option value={62}>Kinderchor</option>
                    <option value={1144}>Klangerzeugung</option>
                    <option value={978}>Klavierduo</option>
                    <option value={406}>Klaviertrio</option>
                    <option value={264}>Knabenchor</option>
                    <option value={1112}>Live-Sendung</option>
                    <option value={299}>Mädchenchor</option>
                    <option value={190}>Männer-Chor</option>
                    <option value={483}>Militärkapelle</option>
                    <option value={873}>Musikgruppe</option>
                    <option value={414}>Nonett</option>
                    <option value={357}>Oktett</option>
                    <option value={10}>Orchester</option>
                    <option value={284}>Posaunenchor</option>
                    <option value={297}>Quartett</option>
                    <option value={1118}>Rhythmusgruppe</option>
                    <option value={54}>Schauspielkunst</option>
                    <option value={887}>Schlagwerk (Musik)</option>
                    <option value={932}>Schlagzeug-Ensemble</option>
                    <option value={484}>Sinfonieorchester</option>
                    <option value={1107}>Sprechchor</option>
                    <option value={82}>Streicher</option>
                    <option value={479}>Streicherensemble</option>
                    <option value={113}>Streichorchester</option>
                    <option value={347}>Streichquartett</option>
                    <option value={407}>Streichquintett</option>
                    <option value={417}>Streichsextett</option>
                    <option value={412}>Streichtrio</option>
                    <option value={1121}>Tanzgruppe</option>
                    <option value={1253}>Tanzkapelle</option>
                    <option value={192}>Trio</option>
                    <option value={1128}>Übertragung / Fernsehen</option>
                    <option value={1109}>Übertragung / Hörfunk</option>
                    <option value={221}>Veranstalter</option>
                    <option value={430}>Vokalensemble</option>
                    <option value={1113}>Zupforchester</option>
                  </select>
                </div>
              </div>
              <div
                  className="form-row row-work"
                  style={{border: 'none', paddingBottom: 0}}
              >
                <strong className="row-label">Werk</strong>
                <div className="form-row-element element-composer">
                  <div className="typeahead__container">
                    <div className="typeahead__field">
                      <div className="typeahead__query">
                        <label className="search-label" htmlFor="composer-searchword">
                          Komponist
                        </label>
                        <div
                            className="autocomplete-selection"
                            style={{height: '38.2481px', left: 10, maxWidth: 268}}
                        />
                        <span className="typeahead__cancel-button">×</span>
                        <input
                            id="composer-searchword"
                            className="search-text js-typeahead autocomplete"
                            defaultValue=""
                            name="composer"
                            autoComplete="off"
                            type="text"
                            data-entities="composer"
                            data-max={300}
                            data-show={8}
                            style={{paddingLeft: 10}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-row-element element-title">
                  <div className="typeahead__container">
                    <div className="typeahead__field">
                      <div className="typeahead__query">
                        <label className="search-label" htmlFor="work-searchword">
                          Werk
                        </label>
                        <div
                            className="autocomplete-selection"
                            style={{height: '38.2481px', left: 10, maxWidth: 268}}
                        />
                        <span className="typeahead__cancel-button">×</span>
                        <input
                            id="work-searchword"
                            className="search-text js-typeahead autocomplete"
                            defaultValue=""
                            name="work"
                            autoComplete="off"
                            type="text"
                            data-entities="work"
                            data-max={300}
                            data-show={8}
                            style={{paddingLeft: 10}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-row row-work">
                <strong className="row-label"/>
                <div className="form-row-element select-genre">
                  <select id="work-genre" name="genre">
                    <option value="">Alle Gattungen</option>
                    <option value={149}>Adagio</option>
                    <option value={129}>Agnus-Dei-Vertonung</option>
                    <option value={182}>Air</option>
                    <option value={875}>Akkordeonmusik</option>
                    <option value={723}>Allegretto</option>
                    <option value={223}>Allegro</option>
                    <option value={598}>Alleluja</option>
                    <option value={390}>Allemande</option>
                    <option value={180}>Andante</option>
                    <option value={448}>Andantino</option>
                    <option value={181}>Anthem</option>
                    <option value={750}>Antiphon</option>
                    <option value={396}>Arabeske (Musik)</option>
                    <option value={111}>Arie</option>
                    <option value={403}>Ariette</option>
                    <option value={123}>Arioso</option>
                    <option value={741}>Arrangement</option>
                    <option value={924}>Badinage</option>
                    <option value={521}>Bagatelle (Musik)</option>
                    <option value={364}>Ballade (Musik)</option>
                    <option value={920}>Ballet de cour</option>
                    <option value={465}>Ballett</option>
                    <option value={318}>Ballettmusik</option>
                    <option value={539}>Balletto</option>
                    <option value={370}>Barkarole</option>
                    <option value={360}>Berceuse</option>
                    <option value={654}>Bicinium</option>
                    <option value={798}>Bläserquintett</option>
                    <option value={1265}>Bläsertrio</option>
                    <option value={282}>Blas- und Bläsermusik</option>
                    <option value={857}>Blechblasinstrumentenmusik</option>
                    <option value={604}>Bolero (Musik)</option>
                    <option value={426}>Bourrée</option>
                    <option value={319}>Bühnenmusik</option>
                    <option value={769}>Bühnenwerk</option>
                    <option value={745}>Burleske (Musik)</option>
                    <option value={891}>Cancan</option>
                    <option value={384}>Capriccio (Musik)</option>
                    <option value={815}>Carol</option>
                    <option value={188}>Chaconne</option>
                    <option value={512}>Chanson</option>
                    <option value={231}>Charakterstück</option>
                    <option value={168}>Choral</option>
                    <option value={156}>Choralbearbeitung</option>
                    <option value={210}>Choralfantasie</option>
                    <option value={760}>Choralkantate</option>
                    <option value={768}>Choralkonzert</option>
                    <option value={240}>Choralmotette</option>
                    <option value={315}>Choralpartita</option>
                    <option value={508}>Choralvariation</option>
                    <option value={157}>Choralvorspiel</option>
                    <option value={167}>Chorlied</option>
                    <option value={195}>Chormusik</option>
                    <option value={386}>Concerto</option>
                    <option value={387}>Concerto grosso</option>
                    <option value={925}>Contredanse</option>
                    <option value={845}>Couplet</option>
                    <option value={1245}>Courante</option>
                    <option value={542}>Credo-Vertonung</option>
                    <option value={781}>Csárdás</option>
                    <option value={1236}>Danse Musette</option>
                    <option value={535}>Deutscher Tanz</option>
                    <option value={213}>Dialog (Musik)</option>
                    <option value={333}>Divertimento</option>
                    <option value={418}>Doppelquartett</option>
                    <option value={212}>Duett</option>
                    <option value={411}>Duo</option>
                    <option value={789}>Écossaise</option>
                    <option value={733}>Elegie</option>
                    <option value={462}>Elegie (Musik)</option>
                    <option value={1047}>Elektronische Musik</option>
                    <option value={444}>Entracte</option>
                    <option value={591}>Estampie</option>
                    <option value={362}>Etüde</option>
                    <option value={681}>Evangelienmotette</option>
                    <option value={711}>Fagottkonzert</option>
                    <option value={870}>Fandango</option>
                    <option value={312}>Fanfare (Signalmusik)</option>
                    <option value={169}>Fantasie (Musik)</option>
                    <option value={926}>Farce (Musik)</option>
                    <option value={1177}>Fernsehspiel</option>
                    <option value={575}>Festmusik</option>
                    <option value={821}>Filmmusik</option>
                    <option value={349}>Finale</option>
                    <option value={543}>Flötenkonzert</option>
                    <option value={730}>Flötenmusik</option>
                    <option value={607}>Flötenquintett</option>
                    <option value={897}>Fragment</option>
                    <option value={1250}>Fugato</option>
                    <option value={119}>Fuge</option>
                    <option value={1165}>Fughetta</option>
                    <option value={929}>Furiant (Tanz)</option>
                    <option value={538}>Galliarde</option>
                    <option value={565}>Galopp (Musik)</option>
                    <option value={356}>Gavotte</option>
                    <option value={731}>Gebet</option>
                    <option value={153}>Geistliche Musik</option>
                    <option value={81}>Geistliches Konzert</option>
                    <option value={98}>Geistliches Lied</option>
                    <option value={131}>Gesang</option>
                    <option value={296}>Gesangbuch</option>
                    <option value={298}>Gesangsquartett</option>
                    <option value={214}>Gesellschaftstanz</option>
                    <option value={441}>Gigue</option>
                    <option value={991}>Gitarrenmusik</option>
                    <option value={222}>Gloria-Vertonung</option>
                    <option value={302}>Graduale-Vertonung</option>
                    <option value={189}>Grave (Musik)</option>
                    <option value={1122}>Groteske (Musik)</option>
                    <option value={970}>Ground</option>
                    <option value={471}>Habanera</option>
                    <option value={336}>Harfenmusik</option>
                    <option value={363}>Heroisch-komische Oper</option>
                    <option value={1131}>Hörspielmusik</option>
                    <option value={813}>Hornkonzert</option>
                    <option value={1095}>Humoreske</option>
                    <option value={447}>Humoreske (Musik)</option>
                    <option value={173}>Hymne</option>
                    <option value={355}>Impromptu</option>
                    <option value={757}>Improperien</option>
                    <option value={885}>Improvisation</option>
                    <option value={346}>Instrumentale Kammermusik</option>
                    <option value={86}>Instrumentalmusik</option>
                    <option value={148}>Instrumentalstück</option>
                    <option value={899}>Interlude</option>
                    <option value={717}>Intermedium (Musik)</option>
                    <option value={301}>Intermezzo (Charakterstück)</option>
                    <option value={898}>Intermezzo (Theater)</option>
                    <option value={313}>Intrada</option>
                    <option value={194}>Introduktion</option>
                    <option value={627}>Introitus-Vertonung</option>
                    <option value={829}>Invention</option>
                    <option value={1235}>Jazz</option>
                    <option value={852}>Jazzsong</option>
                    <option value={1073}>Jig</option>
                    <option value={883}>Kadenz (Konzert)</option>
                    <option value={1023}>Kammerkantate</option>
                    <option value={793}>Kammerkonzert</option>
                    <option value={606}>Kammermusik</option>
                    <option value={1232}>Kammeroper</option>
                    <option value={715}>Kammersinfonie</option>
                    <option value={928}>Kammersonate</option>
                    <option value={314}>Kanon (Musik)</option>
                    <option value={101}>Kantate</option>
                    <option value={605}>Kantilene</option>
                    <option value={136}>Kanzone (Musik)</option>
                    <option value={410}>Kanzonette</option>
                    <option value={872}>Kassation (Musik)</option>
                    <option value={371}>Kavatine</option>
                    <option value={779}>Kinderlied</option>
                    <option value={1123}>Kindermusical</option>
                    <option value={1011}>Kinderoper</option>
                    <option value={635}>Kirchenlied</option>
                    <option value={100}>Kirchenmusik</option>
                    <option value={804}>Kirchensonate</option>
                    <option value={573}>Klarinettenkonzert</option>
                    <option value={982}>Klarinettenmusik</option>
                    <option value={413}>Klarinettenquintett</option>
                    <option value={978}>Klavierduo</option>
                    <option value={368}>Klavierkonzert</option>
                    <option value={277}>Klaviermusik</option>
                    <option value={422}>Klavierquartett</option>
                    <option value={427}>Klavierquintett</option>
                    <option value={395}>Klaviersonate</option>
                    <option value={406}>Klaviertrio</option>
                    <option value={445}>Klaviervariation</option>
                    <option value={1092}>Klezmer</option>
                    <option value={58}>Komische Oper</option>
                    <option value={531}>Komödie</option>
                    <option value={941}>Komposition (Musik)</option>
                    <option value={818}>Kontrabasskonzert</option>
                    <option value={87}>Konzert</option>
                    <option value={388}>Konzertouvertüre</option>
                    <option value={331}>Konzertstück</option>
                    <option value={178}>Kyrie-Vertonung</option>
                    <option value={739}>Ländler</option>
                    <option value={886}>Lamento</option>
                    <option value={401}>Larghetto</option>
                    <option value={115}>Largo</option>
                    <option value={655}>Lauda</option>
                    <option value={742}>Liebeslied</option>
                    <option value={91}>Lied</option>
                    <option value={354}>Lied ohne Worte</option>
                    <option value={295}>Liederbuch</option>
                    <option value={490}>Liederspiel</option>
                    <option value={224}>Liederzyklus</option>
                    <option value={664}>Litanei-Vertonung</option>
                    <option value={340}>Literatur</option>
                    <option value={88}>Lyrik</option>
                    <option value={342}>Lyrisches Drama</option>
                    <option value={399}>Madrigal</option>
                    <option value={782}>Märchendrama</option>
                    <option value={207}>Märchenoper</option>
                    <option value={201}>Magnificat-Vertonung</option>
                    <option value={285}>Marschmusik</option>
                    <option value={866}>Maskerade</option>
                    <option value={443}>Mazurka</option>
                    <option value={469}>Melodie</option>
                    <option value={963}>Melodram</option>
                    <option value={343}>Melodrama</option>
                    <option value={382}>Menuett</option>
                    <option value={128}>Messvertonung</option>
                    <option value={612}>Militärmarsch</option>
                    <option value={611}>Militärmusik</option>
                    <option value={1093}>Milonga</option>
                    <option value={740}>Miniatur (Musik)</option>
                    <option value={734}>Moderato</option>
                    <option value={415}>Moment musical</option>
                    <option value={864}>Monodrama</option>
                    <option value={515}>Morisca</option>
                    <option value={76}>Motette</option>
                    <option value={816}>Musical</option>
                    <option value={2}>Musiktheater</option>
                    <option value={1103}>Nachspiel (Musik)</option>
                    <option value={676}>Nationalhymne</option>
                    <option value={1070}>Negrospiritual</option>
                    <option value={414}>Nonett</option>
                    <option value={276}>Notturno</option>
                    <option value={361}>Novellette</option>
                    <option value={792}>Oboenkonzert</option>
                    <option value={89}>Ode</option>
                    <option value={124}>Offertorium-Vertonung</option>
                    <option value={357}>Oktett</option>
                    <option value={3}>Oper</option>
                    <option value={921}>Opéra-ballet</option>
                    <option value={322}>Opera buffa</option>
                    <option value={321}>Opéra comique</option>
                    <option value={803}>Opera seria</option>
                    <option value={64}>Operette</option>
                    <option value={154}>Oratorium</option>
                    <option value={365}>Orchester-Suite</option>
                    <option value={744}>Orchesterlied</option>
                    <option value={197}>Orchestermusik</option>
                    <option value={503}>Orgelchoral</option>
                    <option value={308}>Orgelkonzert</option>
                    <option value={146}>Orgelmusik</option>
                    <option value={530}>Orgelsinfonie</option>
                    <option value={275}>Ostinato</option>
                    <option value={274}>Ouvertüre</option>
                    <option value={216}>Padoana</option>
                    <option value={964}>Pantomime</option>
                    <option value={393}>Paraphrase (Musik)</option>
                    <option value={307}>Partita</option>
                    <option value={1314}>Paso doble</option>
                    <option value={70}>Passacaglia</option>
                    <option value={691}>Passionslied</option>
                    <option value={158}>Passionsmusik</option>
                    <option value={199}>Passionsoratorium</option>
                    <option value={330}>Pasticcio</option>
                    <option value={234}>Pastorale</option>
                    <option value={951}>Pastorelle</option>
                    <option value={838}>Pavane</option>
                    <option value={1038}>Poem</option>
                    <option value={540}>Polka</option>
                    <option value={566}>Polka française</option>
                    <option value={860}>Polka-Mazurka</option>
                    <option value={332}>Polonaise</option>
                    <option value={1105}>Posse</option>
                    <option value={552}>Potpourri</option>
                    <option value={127}>Präludium</option>
                    <option value={727}>Presto</option>
                    <option value={420}>Programmmusik</option>
                    <option value={122}>Psalmlied</option>
                    <option value={150}>Psalmmotette</option>
                    <option value={147}>Psalmvertonung</option>
                    <option value={1172}>Puppenspielmusik</option>
                    <option value={562}>Quadrille</option>
                    <option value={297}>Quartett</option>
                    <option value={348}>Quintett</option>
                    <option value={683}>Quodlibet</option>
                    <option value={841}>Ragtime</option>
                    <option value={1249}>Reigen</option>
                    <option value={229}>Requiem-Vertonung</option>
                    <option value={704}>Responsorium</option>
                    <option value={209}>Rezitativ</option>
                    <option value={232}>Rhapsodie</option>
                    <option value={796}>Ricercar</option>
                    <option value={466}>Rigaudon</option>
                    <option value={700}>Ritornell (Musik)</option>
                    <option value={278}>Romanze (Musik)</option>
                    <option value={923}>Rondeau</option>
                    <option value={389}>Rondo</option>
                    <option value={1130}>Rundfunkmusik</option>
                    <option value={564}>Rundtanz</option>
                    <option value={784}>Salonmusik</option>
                    <option value={738}>Saltarello</option>
                    <option value={751}>Salve-Regina-Vertonung</option>
                    <option value={200}>Sanctus-Vertonung</option>
                    <option value={391}>Sarabande</option>
                    <option value={183}>Satz (Musikstück)</option>
                    <option value={317}>Schauspielmusik</option>
                    <option value={377}>Scherzo</option>
                    <option value={1039}>Schlager</option>
                    <option value={992}>Schlaginstrumentenmusik</option>
                    <option value={993}>Schlagzeugmusik</option>
                    <option value={300}>Schlusschor</option>
                    <option value={405}>Septett</option>
                    <option value={358}>Serenade</option>
                    <option value={434}>Serenata</option>
                    <option value={880}>Sevillana</option>
                    <option value={416}>Sextett</option>
                    <option value={408}>Siciliano</option>
                    <option value={139}>Sinfonia</option>
                    <option value={198}>Sinfonie</option>
                    <option value={690}>Sinfonietta</option>
                    <option value={421}>Sinfonische Dichtung</option>
                    <option value={65}>Singspiel</option>
                    <option value={1010}>Skizze (Musik)</option>
                    <option value={788}>Solfège</option>
                    <option value={350}>Solo (Musik)</option>
                    <option value={249}>Solosonate</option>
                    <option value={130}>Sonate</option>
                    <option value={802}>Sonatine</option>
                    <option value={817}>Song</option>
                    <option value={546}>Spieloper</option>
                    <option value={140}>Stabat-Mater-Vertonung</option>
                    <option value={372}>Streichmusik</option>
                    <option value={961}>Streichoktett</option>
                    <option value={347}>Streichquartett</option>
                    <option value={407}>Streichquintett</option>
                    <option value={417}>Streichsextett</option>
                    <option value={412}>Streichtrio</option>
                    <option value={787}>Studie</option>
                    <option value={187}>Suite</option>
                    <option value={367}>Symphonie concertante</option>
                    <option value={369}>Szene</option>
                    <option value={1102}>Tabulatur</option>
                    <option value={825}>Tango</option>
                    <option value={69}>Tanz</option>
                    <option value={952}>Tanzlied</option>
                    <option value={452}>Tanzmusik</option>
                    <option value={376}>Tanzsatz</option>
                    <option value={352}>Tarantella</option>
                    <option value={145}>Tasteninstrumentenmusik</option>
                    <option value={176}>Te-Deum-Vertonung</option>
                    <option value={279}>Terzett (Musik)</option>
                    <option value={1}>Theater</option>
                    <option value={446}>Thema (Musik)</option>
                    <option value={294}>Tiento</option>
                    <option value={162}>Tokkata</option>
                    <option value={378}>Tragédie lyrique</option>
                    <option value={922}>Tragödie</option>
                    <option value={442}>Transkription</option>
                    <option value={286}>Trauermarsch</option>
                    <option value={592}>Trauermusik</option>
                    <option value={192}>Trio</option>
                    <option value={805}>Triosonate</option>
                    <option value={765}>Triptychon</option>
                    <option value={894}>Trompetenkonzert</option>
                    <option value={983}>Trompetenmusik</option>
                    <option value={152}>Variation</option>
                    <option value={762}>Vesper</option>
                    <option value={463}>Vierhändige Klaviermusik</option>
                    <option value={511}>Villancico</option>
                    <option value={514}>Villanelle</option>
                    <option value={876}>Violakonzert</option>
                    <option value={373}>Violamusik</option>
                    <option value={179}>Violinkonzert</option>
                    <option value={409}>Violinmusik</option>
                    <option value={400}>Violinsonate</option>
                    <option value={366}>Violoncellokonzert</option>
                    <option value={404}>Violoncellosonate</option>
                    <option value={732}>Vivace</option>
                    <option value={895}>Vokalise</option>
                    <option value={75}>Vokalmusik</option>
                    <option value={219}>Volkslied</option>
                    <option value={398}>Volksmusik</option>
                    <option value={351}>Volkstanz</option>
                    <option value={429}>Vorspiel (Musik)</option>
                    <option value={375}>Walzer</option>
                    <option value={794}>Wechselgesang</option>
                    <option value={644}>Weihnachtserzählung</option>
                    <option value={233}>Weihnachtslied</option>
                    <option value={595}>Weihnachtsmusik</option>
                    <option value={865}>Weltliche Kantate</option>
                    <option value={439}>Wiegenlied</option>
                    <option value={780}>Zapfenstreich</option>
                    <option value={847}>Zarzuela</option>
                    <option value={574}>Zusammenstellung</option>
                    <option value={909}>Zyklus</option>
                  </select>
                </div>
                <div className="form-row-element select-genre">
                  <select id="work-genre" name="workmedium">
                    <option value="">Alle Besetzungen</option>
                    <option value={649}>Akkordeon</option>
                    <option value={988}>Akkordeonorchester</option>
                    <option value={1164}>Alphorn</option>
                    <option value={33}>Alt (Stimmlage)</option>
                    <option value={850}>Altblockflöte</option>
                    <option value={828}>Altposaune</option>
                    <option value={1084}>Altquerflöte</option>
                    <option value={844}>Altsaxofon</option>
                    <option value={953}>Arpeggione</option>
                    <option value={907}>Ausführung (Musik)</option>
                    <option value={1035}>Bajan</option>
                    <option value={1094}>Balalaika</option>
                    <option value={848}>Bandoneon</option>
                    <option value={1168}>Banjo</option>
                    <option value={7}>Bariton (Stimmlage)</option>
                    <option value={814}>Baryton</option>
                    <option value={8}>Bass (Stimmlage)</option>
                    <option value={326}>Bassbariton (Stimmlage)</option>
                    <option value={1258}>Basse de viole</option>
                    <option value={712}>Bassetthorn</option>
                    <option value={1325}>Bassgambe</option>
                    <option value={1033}>Bassgitarre</option>
                    <option value={423}>Bassinstrument</option>
                    <option value={520}>Bassklarinette</option>
                    <option value={78}>Basso continuo</option>
                    <option value={501}>Bassposaune</option>
                    <option value={1040}>Bassquerflöte</option>
                    <option value={856}>Becken (Musikinstrument)</option>
                    <option value={874}>Big Band</option>
                    <option value={134}>Bläser</option>
                    <option value={248}>Bläserensemble</option>
                    <option value={798}>Bläserquintett</option>
                    <option value={1225}>Blasharmonika</option>
                    <option value={102}>Blasinstrument</option>
                    <option value={238}>Blasorchester</option>
                    <option value={288}>Blechbläser</option>
                    <option value={191}>Blechbläser-Ensemble</option>
                    <option value={163}>Blechblasinstrument</option>
                    <option value={211}>Blockflöte</option>
                    <option value={567}>Blockflöten-Ensemble</option>
                    <option value={1276}>Bodypercussion</option>
                    <option value={1195}>Bongo</option>
                    <option value={1090}>Brassband</option>
                    <option value={671}>Calichon</option>
                    <option value={527}>Celesta</option>
                    <option value={143}>Cembalo</option>
                    <option value={837}>Chalumeau</option>
                    <option value={61}>Chor</option>
                    <option value={675}>Clarino</option>
                    <option value={1134}>Combo</option>
                    <option value={638}>Cornettino</option>
                    <option value={657}>Countertenor (Stimmlage)</option>
                    <option value={698}>Deklamation</option>
                    <option value={1142}>Dialogsystem</option>
                    <option value={1052}>Digitale Schallaufzeichnung</option>
                    <option value={1251}>Diskant</option>
                    <option value={550}>Diskantgambe</option>
                    <option value={1046}>Domra</option>
                    <option value={930}>Drehleier</option>
                    <option value={973}>Effektinstrument</option>
                    <option value={994}>Elektrisches Klavier</option>
                    <option value={1301}>Elektrobass</option>
                    <option value={1022}>Elektrogitarre</option>
                    <option value={1205}>Elektronenorgel</option>
                    <option value={888}>Elektronik (Musik)</option>
                    <option value={806}>Elektronisches Musikinstrument</option>
                    <option value={1048}>Elektronisches Tasteninstrument</option>
                    <option value={533}>Englischhorn</option>
                    <option value={217}>Ensemble</option>
                    <option value={112}>Fagott</option>
                    <option value={582}>Fanfarenzug</option>
                    <option value={1091}>Flageolett</option>
                    <option value={133}>Flöte</option>
                    <option value={171}>Flötenuhr</option>
                    <option value={687}>Flügelhorn</option>
                    <option value={1312}>Folkloregruppe</option>
                    <option value={402}>Frauen-Singstimme</option>
                    <option value={266}>Frauenchor</option>
                    <option value={292}>Gemeinde</option>
                    <option value={60}>Gemischter Chor</option>
                    <option value={1133}>Gesangsgruppe</option>
                    <option value={298}>Gesangsquartett</option>
                    <option value={440}>Gitarre</option>
                    <option value={882}>Glasharmonika</option>
                    <option value={1136}>Glocke</option>
                    <option value={585}>Glockenspiel</option>
                    <option value={586}>Gong</option>
                    <option value={1161}>Große Trommel</option>
                    <option value={263}>Harfe</option>
                    <option value={316}>Harmonium</option>
                    <option value={849}>Heckelphon</option>
                    <option value={532}>Holzbläserensemble</option>
                    <option value={103}>Holzblasinstrument</option>
                    <option value={164}>Horn (Musikinstrument)</option>
                    <option value={218}>Instrumentalensemble</option>
                    <option value={208}>Jagdhorn</option>
                    <option value={879}>Jazzband</option>
                    <option value={686}>Jugendchor</option>
                    <option value={544}>Kammerorchester</option>
                    <option value={1117}>Keyboard</option>
                    <option value={62}>Kinderchor</option>
                    <option value={225}>Klarinette</option>
                    <option value={94}>Klavier</option>
                    <option value={427}>Klavierquintett</option>
                    <option value={809}>Kleine Trommel</option>
                    <option value={536}>Kleinorgel</option>
                    <option value={264}>Knabenchor</option>
                    <option value={261}>Knabenstimme</option>
                    <option value={702}>Kontra-Alt</option>
                    <option value={203}>Kontrabass</option>
                    <option value={709}>Kontrafagott</option>
                    <option value={560}>Kornett</option>
                    <option value={1231}>Koto</option>
                    <option value={306}>Laute</option>
                    <option value={990}>Lautenclavier</option>
                    <option value={646}>Lituus (Musikinstrument)</option>
                    <option value={190}>Männer-Chor</option>
                    <option value={304}>Männer-Singstimme</option>
                    <option value={670}>Mandola</option>
                    <option value={911}>Mandoline</option>
                    <option value={1082}>Marimba</option>
                    <option value={1043}>Melodieinstrument</option>
                    <option value={584}>Metallophon</option>
                    <option value={20}>Mezzosopran</option>
                    <option value={483}>Militärkapelle</option>
                    <option value={71}>Musikinstrument</option>
                    <option value={106}>Oboe</option>
                    <option value={160}>Oboe da caccia</option>
                    <option value={159}>Oboe d'Amore</option>
                    <option value={853}>Ondes Martenot</option>
                    <option value={10}>Orchester</option>
                    <option value={73}>Orgel</option>
                    <option value={1014}>Orgelpedal</option>
                    <option value={1104}>Panflöte</option>
                    <option value={186}>Pauke</option>
                    <option value={493}>Pikkoloflöte</option>
                    <option value={166}>Posaune</option>
                    <option value={284}>Posaunenchor</option>
                    <option value={537}>Positiv (Musikinstrument)</option>
                    <option value={1027}>Präpariertes Klavier</option>
                    <option value={237}>Querflöte</option>
                    <option value={1118}>Rhythmusgruppe</option>
                    <option value={1196}>Rockgruppe</option>
                    <option value={937}>Sackpfeife</option>
                    <option value={397}>Salonorchester</option>
                    <option value={826}>Saxofon</option>
                    <option value={54}>Schauspielkunst</option>
                    <option value={185}>Schlaginstrument</option>
                    <option value={887}>Schlagwerk (Musik)</option>
                    <option value={522}>Schlagzeug</option>
                    <option value={932}>Schlagzeug-Ensemble</option>
                    <option value={484}>Sinfonieorchester</option>
                    <option value={51}>Singstimme</option>
                    <option value={428}>Singstimme (hoch)</option>
                    <option value={155}>Singstimme (mittel)</option>
                    <option value={770}>Singstimme (tief)</option>
                    <option value={915}>Sitar</option>
                    <option value={350}>Solo (Musik)</option>
                    <option value={5}>Sopran</option>
                    <option value={572}>Sopranblockflöte</option>
                    <option value={851}>Sopransaxofon</option>
                    <option value={1271}>Sounddesign</option>
                    <option value={1138}>Spieldose</option>
                    <option value={1107}>Sprechchor</option>
                    <option value={320}>Sprechstimme</option>
                    <option value={239}>Stimme (Unbestimmte Besetzung)</option>
                    <option value={82}>Streicher</option>
                    <option value={479}>Streicherensemble</option>
                    <option value={108}>Streichinstrument</option>
                    <option value={113}>Streichorchester</option>
                    <option value={347}>Streichquartett</option>
                    <option value={407}>Streichquintett</option>
                    <option value={412}>Streichtrio</option>
                    <option value={1049}>Synthesizer (Musikinstrument)</option>
                    <option value={220}>Taille (Musikinstrument)</option>
                    <option value={587}>Tamtam</option>
                    <option value={69}>Tanz</option>
                    <option value={1253}>Tanzkapelle</option>
                    <option value={92}>Tasteninstrument</option>
                    <option value={6}>Tenor (Stimmlage)</option>
                    <option value={1044}>Tenorblockflöte</option>
                    <option value={685}>Tenorhorn</option>
                    <option value={568}>Tenorposaune</option>
                    <option value={1114}>Tenorsaxofon</option>
                    <option value={820}>Tonband</option>
                    <option value={588}>Triangel</option>
                    <option value={747}>Trommel</option>
                    <option value={184}>Trompete</option>
                    <option value={226}>Tuba</option>
                    <option value={917}>Ud</option>
                    <option value={748}>Ventilhorn</option>
                    <option value={807}>Vibrafon</option>
                    <option value={110}>Viola</option>
                    <option value={242}>Viola da Gamba</option>
                    <option value={305}>Viola d'amore</option>
                    <option value={884}>Viola pomposa</option>
                    <option value={280}>Violetta</option>
                    <option value={109}>Violine</option>
                    <option value={491}>Violino piccolo</option>
                    <option value={137}>Violoncello</option>
                    <option value={245}>Violoncello piccolo</option>
                    <option value={204}>Violone</option>
                    <option value={430}>Vokalensemble</option>
                    <option value={1041}>Volksmusikinstrument</option>
                    <option value={948}>Waldhorn</option>
                    <option value={563}>Xylofon</option>
                    <option value={165}>Zink (Musikinstrument)</option>
                    <option value={610}>Zither</option>
                    <option value={492}>Zugtrompete</option>
                    <option value={262}>Zupfinstrument</option>
                    <option value={1113}>Zupforchester</option>
                    <option value={945}>Zymbal</option>
                  </select>
                </div>
              </div>
              <div className="form-row row-source">
                <strong className="row-label">Quelle</strong>
                <div className="form-row-element">
                  <div className="typeahead__container">
                    <div className="typeahead__field">
                      <div className="typeahead__query">
                        <label className="search-label" htmlFor="source-searchword">
                          Titel
                        </label>
                        <div
                            className="autocomplete-selection"
                            style={{height: '38.2481px', left: 10, maxWidth: 798}}
                        />
                        <span className="typeahead__cancel-button">×</span>
                        <input
                            id="source-searchword"
                            className="search-text js-typeahead autocomplete"
                            defaultValue=""
                            name="source"
                            autoComplete="off"
                            type="text"
                            data-entities="source"
                            data-max={300}
                            data-show={8}
                            style={{paddingLeft: 10}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-row row-project">
                <strong className="row-label">Projekt</strong>
                <div className="form-row-element select-projects">
                  <label htmlFor="project-selection">Projekt</label>
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
                    <option value={6}>
                      Fachinformationsdienst Musikwissenschaft
                    </option>
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
                      Die Erstaufführungen des 'Verdi-Requiems' im deutschsprachigen
                      Raum
                    </option>
                    <option value={22}>Sinfonische Konzerte in Tokyo</option>
                    <option value={17}>Sammlungen der SLUB Dresden</option>
                    <option value={25}>Oper in Berlin 1810–1830</option>
                    <option value={15}>
                      Konzertprogramme des Leipziger Konservatoriums für Musik
                    </option>
                  </select>
                </div>
              </div>
              <input type="hidden" name="complex" defaultValue={1}/>
              <div className="form-row row-submit">
                <button
                    className="search-button"
                    id="search-button"
                    type="submit"
                    name=""
                    value=""
                >
                  suchen
                </button>
              </div>
            </form>
            <div className="facets-toggle"/>
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
