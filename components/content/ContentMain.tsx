import React, {FunctionComponent, useEffect, useState} from 'react'

import {exhibitionPrefixes} from '../exhibtion'
import {remoteSparqlQuery, sparqlSelectViaFieldMappings} from '../utils/sparql'

interface OwnProps {
}

type Props = OwnProps;

type ExhibitionStub = {
  place1: string | undefined
  place2: string | undefined
  name: string | undefined
  type: string | undefined
}


const ContentMain: FunctionComponent<Props> = (props) => {
  const [exhibition, setExhibition] = useState<ExhibitionStub | undefined>()
  useEffect(() => {
    sparqlSelectViaFieldMappings('slmeta:282203', {fieldMapping: {
      name: {kind: 'literal', type: 'xsd:string', predicateURI: 'sladb:a7710', single: true},
      place1: {kind: 'literal', type: 'xsd:string', predicateURI: 'sladb:a7762', single: true},
      place2: {kind: 'literal', type: 'xsd:string', predicateURI: 'sladb:a7772', single: true},
      type: {kind: 'literal', type: 'xsd:string', predicateURI: 'sladb:a7662', single: true}
    },
      prefixes: exhibitionPrefixes,
      permissive: true,
      query: queryString => remoteSparqlQuery(queryString, ['http://localhost:9999/blazegraph/namespace/kb/sparql']),
      })
        .then((exhibition) => {
          setExhibition(exhibition as ExhibitionStub)
        })
  }, [setExhibition])

  if (!exhibition) return null
  return (
      <div className="content">
        <div className="container">
          <div id="c4" className="colName-standard colPos-0 standard list">
            <dl>
              <dl>
                <dt id="event_44711_categories" className="label-categories">
                  Kategorie
                </dt>
                <dd className="categories">
                  <span className="additional-inline">{exhibition.type}</span>
                </dd>
                <dt id="event_44711_uid" className="label-uid">
                  ID
                </dt>
                <dd className="uid">
                  <span className="additional-inline">(ID:44711)</span>
                </dd>
                <dt id="event_44711_title" className="label-title">
                  Titel
                </dt>
                <dd className="title">
                  {exhibition.name}
                  <span className="additional-block">Saison 1871/1872</span>
                </dd>
                <dt id="event_44711_locations" className="label-locations">
                  Ort
                </dt>
                <dd className="locations">
                  <a href="https://performance.musiconn.de/location/alte-buchhaendlerboerse-leipzig">
                    {exhibition.place2}
                  </a>
                  →{' '}
                  <a
                      href="https://performance.musiconn.de/location/leipzig"
                      title="Leipzig"
                  >
                    {exhibition.place1}
                  </a>
                  →{' '}
                  <a
                      href="https://performance.musiconn.de/location/sachsen"
                      title="Sachsen"
                  >
                    Sachsen
                  </a>
                  →{' '}
                  <a
                      href="https://performance.musiconn.de/location/deutschland"
                      title="Deutschland"
                  >
                    Deutschland
                  </a>
                  →{' '}
                  <a
                      href="https://performance.musiconn.de/location/europa"
                      title="Europa"
                  >
                    Europa
                  </a>
                </dd>
                <dt id="event_44711_serials" className="label-serials">
                  Veranstaltungsreihen
                </dt>
                <dd className="serials">
                  <a href="https://performance.musiconn.de/series/konzerte-des-musikvereins-euterpe-saison-1871-1872">
                    Konzerte des Musikvereins Euterpe; Saison 1871/1872
                  </a>
                </dd>
                <dt id="event_44711_corporations" className="label-corporations">
                  Beteiligte Körperschaften
                </dt>
                <dd className="corporations">
                  <a href="https://performance.musiconn.de/corporation/euterpe-orchester-leipzig">
                    Euterpe-Orchester (Leipzig)
                  </a>
                </dd>
                <dt id="event_44711_persons" className="label-persons">
                  Beteiligte Personen
                </dt>
                <dd className="persons">
                  <a href="https://performance.musiconn.de/person/volkland-alfred-1841-1905">
                    Volkland, Alfred (1841–1905)
                  </a>
                </dd>
                <dd className="persons">
                  <a href="https://performance.musiconn.de/person/esipova-anna-n-1851-1914">
                    Esipova, Anna N. (1851–1914)
                  </a>
                </dd>
                <dd className="persons">
                  <a href="https://performance.musiconn.de/person/thuemer-carl-julius">
                    Thümer, Carl Julius
                  </a>
                </dd>
                <dd className="persons">
                  <a href="https://performance.musiconn.de/person/schubert-clara">
                    Schubert, Clara
                  </a>
                </dd>
                <dt id="event_44711_performances" className="label-program">
                  Programm
                </dt>
                <dd className="program">
                  <span className="additional-inline">1)</span>{' '}
                  <a
                      href="https://performance.musiconn.de/work/faniska-ouvertuere-cherubini-luigi"
                      title="Faniska. Ouvertüre (Cherubini, Luigi)"
                  >
                    Faniska. Ouvertüre (Cherubini, Luigi)
                  </a>
                  <span className="additional-block">
                  Besetzung:
                  <a
                      href="https://performance.musiconn.de/corporation/euterpe-orchester-leipzig"
                      title="Euterpe-Orchester (Leipzig)"
                  >
                    Euterpe-Orchester (Leipzig)
                  </a>
                  <a
                      href="https://performance.musiconn.de/person/volkland-alfred-1841-1905"
                      title="Volkland, Alfred (1841–1905)"
                  >
                    Volkland, Alfred (1841–1905)
                  </a>{' '}
                    (
                  <a href="https://performance.musiconn.de/subject/dirigat">
                    Dirigat
                  </a>
                  )
                </span>
                </dd>
                <dd className="program">
                  <span className="additional-inline">2)</span>{' '}
                  <a
                      href="https://performance.musiconn.de/work/beim-abschiede-schubert-franz-ludwig"
                      title="Beim Abschiede (Schubert, Franz Ludwig)"
                  >
                    Beim Abschiede (Schubert, Franz Ludwig)
                  </a>
                  <span className="additional-block">
                  Besetzung:
                  <a
                      href="https://performance.musiconn.de/corporation/euterpe-orchester-leipzig"
                      title="Euterpe-Orchester (Leipzig)"
                  >
                    Euterpe-Orchester (Leipzig)
                  </a>
                  <a
                      href="https://performance.musiconn.de/person/volkland-alfred-1841-1905"
                      title="Volkland, Alfred (1841–1905)"
                  >
                    Volkland, Alfred (1841–1905)
                  </a>{' '}
                    (
                  <a href="https://performance.musiconn.de/subject/dirigat">
                    Dirigat
                  </a>
                  )
                  <a
                      href="https://performance.musiconn.de/person/schubert-clara"
                      title="Schubert, Clara"
                  >
                    Schubert, Clara
                  </a>{' '}
                    (
                  <a href="https://performance.musiconn.de/subject/singstimme">
                    Singstimme
                  </a>
                  )
                </span>
                </dd>
                <dd className="program">
                  <span className="additional-inline">3)</span>{' '}
                  <a
                      href="https://performance.musiconn.de/work/konzerte-klavier-orchester-nr-1-op-11-e-moll-chopin-frederic"
                      title="Konzerte, Klavier, Orchester, Nr. 1, op. 11 (e-Moll) (Chopin, Frédéric)"
                  >
                    Konzerte, Klavier, Orchester, Nr. 1, op. 11 (e-Moll) (Chopin,
                    Frédéric)
                  </a>
                  <span className="additional-block">
                  Besetzung:
                  <a
                      href="https://performance.musiconn.de/corporation/euterpe-orchester-leipzig"
                      title="Euterpe-Orchester (Leipzig)"
                  >
                    Euterpe-Orchester (Leipzig)
                  </a>
                  <a
                      href="https://performance.musiconn.de/person/volkland-alfred-1841-1905"
                      title="Volkland, Alfred (1841–1905)"
                  >
                    Volkland, Alfred (1841–1905)
                  </a>{' '}
                    (
                  <a href="https://performance.musiconn.de/subject/dirigat">
                    Dirigat
                  </a>
                  )
                  <a
                      href="https://performance.musiconn.de/person/esipova-anna-n-1851-1914"
                      title="Esipova, Anna N. (1851–1914)"
                  >
                    Esipova, Anna N. (1851–1914)
                  </a>{' '}
                    (
                  <a href="https://performance.musiconn.de/subject/klavier">
                    Klavier
                  </a>
                  )
                </span>
                </dd>
                <dd className="program">
                  <span className="additional-inline">4)</span>{' '}
                  <a
                      href="https://performance.musiconn.de/work/die-schoene-muellerin-morgengruss-schubert-franz"
                      title="Die schöne Müllerin. Morgengruß (Schubert, Franz)"
                  >
                    Die schöne Müllerin. Morgengruß (Schubert, Franz)
                  </a>
                  <span className="additional-block">
                  Besetzung:
                  <a
                      href="https://performance.musiconn.de/person/schubert-clara"
                      title="Schubert, Clara"
                  >
                    Schubert, Clara
                  </a>{' '}
                    (
                  <a href="https://performance.musiconn.de/subject/singstimme">
                    Singstimme
                  </a>
                  )
                </span>
                </dd>
                <dd className="program">
                  <span className="additional-inline">5)</span>{' '}
                  <a
                      href="https://performance.musiconn.de/work/gesaenge-op-47-der-blumenstrauss-mendelssohn-bartholdy-felix"
                      title="Gesänge op. 47. Der Blumenstrauß (Mendelssohn Bartholdy, Felix)"
                  >
                    Gesänge op. 47. Der Blumenstrauß (Mendelssohn Bartholdy,
                    Felix)
                  </a>
                  <span className="additional-block">
                  Besetzung:
                  <a
                      href="https://performance.musiconn.de/person/schubert-clara"
                      title="Schubert, Clara"
                  >
                    Schubert, Clara
                  </a>{' '}
                    (
                  <a href="https://performance.musiconn.de/subject/singstimme">
                    Singstimme
                  </a>
                  )
                </span>
                </dd>
                <dd className="program">
                  <span className="additional-inline">6)</span>{' '}
                  <a
                      href="https://performance.musiconn.de/work/andante-scherzo-mendelssohn-bartholdy-felix"
                      title="Andante, Scherzo (Mendelssohn Bartholdy, Felix)"
                  >
                    Andante, Scherzo (Mendelssohn Bartholdy, Felix)
                  </a>
                  <span className="additional-block">
                  Besetzung:
                  <a
                      href="https://performance.musiconn.de/person/esipova-anna-n-1851-1914"
                      title="Esipova, Anna N. (1851–1914)"
                  >
                    Esipova, Anna N. (1851–1914)
                  </a>{' '}
                    (
                  <a href="https://performance.musiconn.de/subject/klavier">
                    Klavier
                  </a>
                  )
                </span>
                </dd>
                <dd className="program">
                  <span className="additional-inline">7)</span>{' '}
                  <a
                      href="https://performance.musiconn.de/work/walzer-klavier-raff-joseph-joachim"
                      title="Walzer, Klavier (Raff, Joseph Joachim)"
                  >
                    Walzer, Klavier (Raff, Joseph Joachim)
                  </a>
                  <span className="additional-block">
                  Besetzung:
                  <a
                      href="https://performance.musiconn.de/person/esipova-anna-n-1851-1914"
                      title="Esipova, Anna N. (1851–1914)"
                  >
                    Esipova, Anna N. (1851–1914)
                  </a>{' '}
                    (
                  <a href="https://performance.musiconn.de/subject/klavier">
                    Klavier
                  </a>
                  )
                </span>
                </dd>
                <dd className="program">
                  <span className="additional-inline">8)</span>{' '}
                  <a
                      href="https://performance.musiconn.de/work/bluette-leschetizky-theodor"
                      title="Bluette (Leschetizky, Theodor)"
                  >
                    Bluette (Leschetizky, Theodor)
                  </a>
                  <span className="additional-block">
                  Besetzung:
                  <a
                      href="https://performance.musiconn.de/person/esipova-anna-n-1851-1914"
                      title="Esipova, Anna N. (1851–1914)"
                  >
                    Esipova, Anna N. (1851–1914)
                  </a>{' '}
                    (
                  <a href="https://performance.musiconn.de/subject/klavier">
                    Klavier
                  </a>
                  )
                </span>
                </dd>
                <dd className="program">
                  <span className="additional-inline">9)</span>{' '}
                  <a
                      href="https://performance.musiconn.de/work/harold-en-italie-berlioz-hector"
                      title="Harold en Italie (Berlioz, Hector)"
                  >
                    Harold en Italie (Berlioz, Hector)
                  </a>
                  <span className="additional-block">
                  Besetzung:
                  <a
                      href="https://performance.musiconn.de/corporation/euterpe-orchester-leipzig"
                      title="Euterpe-Orchester (Leipzig)"
                  >
                    Euterpe-Orchester (Leipzig)
                  </a>
                  <a
                      href="https://performance.musiconn.de/person/volkland-alfred-1841-1905"
                      title="Volkland, Alfred (1841–1905)"
                  >
                    Volkland, Alfred (1841–1905)
                  </a>{' '}
                    (
                  <a href="https://performance.musiconn.de/subject/dirigat">
                    Dirigat
                  </a>
                  )
                  <a
                      href="https://performance.musiconn.de/person/thuemer-carl-julius"
                      title="Thümer, Carl Julius"
                  >
                    Thümer, Carl Julius
                  </a>{' '}
                    (
                  <a href="https://performance.musiconn.de/subject/viola">
                    Viola
                  </a>
                  )
                </span>
                </dd>
                <dt id="event_44711_sources" className="label-sources">
                  Quellen
                </dt>
                <dd className="sources" id="event_44711_sources_150">
                  <a href="https://performance.musiconn.de/source/neue-zeitschrift-fuer-musik-nzfm">
                    Neue Zeitschrift für Musik (NZfM)
                  </a>
                  <span className="additional-inline"> (1872, S. 59f.)</span>
                </dd>
                <dd className="sources" id="event_44711_sources_240">
                  <a href="https://performance.musiconn.de/source/programmzettel-113">
                    Programmzettel
                  </a>
                </dd>
                <dd className="sources" id="event_44711_sources_3947">
                  <a href="https://performance.musiconn.de/source/stadtbibliothek-leipzig">
                    Stadtbibliothek Leipzig
                  </a>
                  <span className="additional-inline">
                  {' '}
                    (
                  <a
                      href="https://digital.slub-dresden.de/id507696093"
                      title="https://digital.slub-dresden.de/id507696093"
                      target="_blank"
                      rel="noreferrer"
                  >
                    https://digital.slub-dresden.de/id507696093
                  </a>
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
                        <a
                            href="https://performance.musiconn.de/event/id/44711?tx_mpeext_eventplugin%5Bpage%5D%5Bevent_44711_sources_3947%5D=2&cHash=7507e719beff129b918ffecf69e00c81"
                            title="vor"
                            data-next="/event/id/44711?plain=true&props=uid%7Csources&tx_mpeext_eventplugin%5Bpage%5D%5Bevent_44711_sources_3947%5D=2&cHash=4416f3d06e6b6da882b30822d9cfa074"
                        >
                          →
                        </a>
                      </span>
                    </span>
                  </span>
                </span>
                  <figure style={{display: 'inline-block', margin: '5px 5px'}}>
                    <a
                        href="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000001.tif.large.jpg/full/full/0/default.jpg"
                        target="_blank"
                        title="Seite [ - ]" rel="noreferrer"
                    >
                      <img
                          src="./concert01/data_kitodo_ProdeKoi_507696093_0007_ProdeKoi_507696093_0007_tif_jpegs_00000001.tif.large.jpg.jpg"
                          data-fancybox="gallery"
                          data-type="image"
                          data-src="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000001.tif.large.jpg/full/full/0/default.jpg"
                      />
                    </a>
                    <figcaption>Seite [ - ]</figcaption>
                  </figure>
                  <figure style={{display: 'inline-block', margin: '5px 5px'}}>
                    <a
                        href="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000002.tif.large.jpg/full/full/0/default.jpg"
                        target="_blank"
                        title="Seite [ - ]" rel="noreferrer"
                    >
                      <img
                          src="./concert01/data_kitodo_ProdeKoi_507696093_0007_ProdeKoi_507696093_0007_tif_jpegs_00000002.tif.large.jpg.jpg"
                          data-fancybox="gallery"
                          data-type="image"
                          data-src="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000002.tif.large.jpg/full/full/0/default.jpg"
                      />
                    </a>
                    <figcaption>Seite [ - ]</figcaption>
                  </figure>
                  <figure style={{display: 'inline-block', margin: '5px 5px'}}>
                    <a
                        href="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000003.tif.large.jpg/full/full/0/default.jpg"
                        target="_blank"
                        title="Seite [ - ]" rel="noreferrer"
                    >
                      <img
                          src="./concert01/data_kitodo_ProdeKoi_507696093_0007_ProdeKoi_507696093_0007_tif_jpegs_00000003.tif.large.jpg.jpg"
                          data-fancybox="gallery"
                          data-type="image"
                          data-src="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000003.tif.large.jpg/full/full/0/default.jpg"
                      />
                    </a>
                    <figcaption>Seite [ - ]</figcaption>
                  </figure>
                  <figure style={{display: 'inline-block', margin: '5px 5px'}}>
                    <a
                        href="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000004.tif.large.jpg/full/full/0/default.jpg"
                        target="_blank"
                        title="Seite [ - ]" rel="noreferrer"
                    >
                      <img
                          src="./concert01/data_kitodo_ProdeKoi_507696093_0007_ProdeKoi_507696093_0007_tif_jpegs_00000004.tif.large.jpg.jpg"
                          data-fancybox="gallery"
                          data-type="image"
                          data-src="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000004.tif.large.jpg/full/full/0/default.jpg"
                      />
                    </a>
                    <figcaption>Seite [ - ]</figcaption>
                  </figure>
                  <figure style={{display: 'inline-block', margin: '5px 5px'}}>
                    <a
                        href="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000005.tif.large.jpg/full/full/0/default.jpg"
                        target="_blank"
                        title="Seite [ - ]" rel="noreferrer"
                    >
                      <img
                          src="./concert01/data_kitodo_ProdeKoi_507696093_0007_ProdeKoi_507696093_0007_tif_jpegs_00000005.tif.large.jpg.jpg"
                          data-fancybox="gallery"
                          data-type="image"
                          data-src="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000005.tif.large.jpg/full/full/0/default.jpg"
                      />
                    </a>
                    <figcaption>Seite [ - ]</figcaption>
                  </figure>
                  <figure style={{display: 'inline-block', margin: '5px 5px'}}>
                    <a
                        href="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000006.tif.large.jpg/full/full/0/default.jpg"
                        target="_blank"
                        title="Seite [ - ]" rel="noreferrer"
                    >
                      <img
                          src="./concert01/data_kitodo_ProdeKoi_507696093_0007_ProdeKoi_507696093_0007_tif_jpegs_00000006.tif.large.jpg.jpg"
                          data-fancybox="gallery"
                          data-type="image"
                          data-src="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000006.tif.large.jpg/full/full/0/default.jpg"
                      />
                    </a>
                    <figcaption>Seite [ - ]</figcaption>
                  </figure>
                  <figure style={{display: 'inline-block', margin: '5px 5px'}}>
                    <a
                        href="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000007.tif.large.jpg/full/full/0/default.jpg"
                        target="_blank"
                        title="Seite [ - ]" rel="noreferrer"
                    >
                      <img
                          src="./concert01/data_kitodo_ProdeKoi_507696093_0007_ProdeKoi_507696093_0007_tif_jpegs_00000007.tif.large.jpg.jpg"
                          data-fancybox="gallery"
                          data-type="image"
                          data-src="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000007.tif.large.jpg/full/full/0/default.jpg"
                      />
                    </a>
                    <figcaption>Seite [ - ]</figcaption>
                  </figure>
                  <figure style={{display: 'inline-block', margin: '5px 5px'}}>
                    <a
                        href="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000008.tif.large.jpg/full/full/0/default.jpg"
                        target="_blank"
                        title="Seite [ - ]" rel="noreferrer"
                    >
                      <img
                          src="./concert01/data_kitodo_ProdeKoi_507696093_0007_ProdeKoi_507696093_0007_tif_jpegs_00000008.tif.large.jpg.jpg"
                          data-fancybox="gallery"
                          data-type="image"
                          data-src="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000008.tif.large.jpg/full/full/0/default.jpg"
                      />
                    </a>
                    <figcaption>Seite [ - ]</figcaption>
                  </figure>
                  <figure style={{display: 'inline-block', margin: '5px 5px'}}>
                    <a
                        href="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000009.tif.large.jpg/full/full/0/default.jpg"
                        target="_blank"
                        title="Seite [ - ]" rel="noreferrer"
                    >
                      <img
                          src="./concert01/data_kitodo_ProdeKoi_507696093_0007_ProdeKoi_507696093_0007_tif_jpegs_00000009.tif.large.jpg.jpg"
                          data-fancybox="gallery"
                          data-type="image"
                          data-src="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000009.tif.large.jpg/full/full/0/default.jpg"
                      />
                    </a>
                    <figcaption>Seite [ - ]</figcaption>
                  </figure>
                  <figure style={{display: 'inline-block', margin: '5px 5px'}}>
                    <a
                        href="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000010.tif.large.jpg/full/full/0/default.jpg"
                        target="_blank"
                        title="Seite [ - ]" rel="noreferrer"
                    >
                      <img
                          src="./concert01/data_kitodo_ProdeKoi_507696093_0007_ProdeKoi_507696093_0007_tif_jpegs_00000010.tif.large.jpg.jpg"
                          data-fancybox="gallery"
                          data-type="image"
                          data-src="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000010.tif.large.jpg/full/full/0/default.jpg"
                      />
                    </a>
                    <figcaption>Seite [ - ]</figcaption>
                  </figure>
                  <figure style={{display: 'inline-block', margin: '5px 5px'}}>
                    <a
                        href="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000011.tif.large.jpg/full/full/0/default.jpg"
                        target="_blank"
                        title="Seite [ - ]" rel="noreferrer"
                    >
                      <img
                          src="./concert01/data_kitodo_ProdeKoi_507696093_0007_ProdeKoi_507696093_0007_tif_jpegs_00000011.tif.large.jpg.jpg"
                          data-fancybox="gallery"
                          data-type="image"
                          data-src="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000011.tif.large.jpg/full/full/0/default.jpg"
                      />
                    </a>
                    <figcaption>Seite [ - ]</figcaption>
                  </figure>
                  <figure style={{display: 'inline-block', margin: '5px 5px'}}>
                    <a
                        href="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000012.tif.large.jpg/full/full/0/default.jpg"
                        target="_blank"
                        title="Seite [ - ]" rel="noreferrer"
                    >
                      <img
                          src="./concert01/data_kitodo_ProdeKoi_507696093_0007_ProdeKoi_507696093_0007_tif_jpegs_00000012.tif.large.jpg.jpg"
                          data-fancybox="gallery"
                          data-type="image"
                          data-src="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000012.tif.large.jpg/full/full/0/default.jpg"
                      />
                    </a>
                    <figcaption>Seite [ - ]</figcaption>
                  </figure>
                  <figure style={{display: 'inline-block', margin: '5px 5px'}}>
                    <a
                        href="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000013.tif.large.jpg/full/full/0/default.jpg"
                        target="_blank"
                        title="Seite [ - ]" rel="noreferrer"
                    >
                      <img
                          src="./concert01/data_kitodo_ProdeKoi_507696093_0007_ProdeKoi_507696093_0007_tif_jpegs_00000013.tif.large.jpg.jpg"
                          data-fancybox="gallery"
                          data-type="image"
                          data-src="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000013.tif.large.jpg/full/full/0/default.jpg"
                      />
                    </a>
                    <figcaption>Seite [ - ]</figcaption>
                  </figure>
                  <figure style={{display: 'inline-block', margin: '5px 5px'}}>
                    <a
                        href="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000014.tif.large.jpg/full/full/0/default.jpg"
                        target="_blank"
                        title="Seite [ - ]" rel="noreferrer"
                    >
                      <img
                          src="./concert01/data_kitodo_ProdeKoi_507696093_0007_ProdeKoi_507696093_0007_tif_jpegs_00000014.tif.large.jpg.jpg"
                          data-fancybox="gallery"
                          data-type="image"
                          data-src="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000014.tif.large.jpg/full/full/0/default.jpg"
                      />
                    </a>
                    <figcaption>Seite [ - ]</figcaption>
                  </figure>
                  <figure style={{display: 'inline-block', margin: '5px 5px'}}>
                    <a
                        href="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000015.tif.large.jpg/full/full/0/default.jpg"
                        target="_blank"
                        title="Seite [ - ]" rel="noreferrer"
                    >
                      <img
                          src="./concert01/data_kitodo_ProdeKoi_507696093_0007_ProdeKoi_507696093_0007_tif_jpegs_00000015.tif.large.jpg.jpg"
                          data-fancybox="gallery"
                          data-type="image"
                          data-src="https://images.iiif.slub-dresden.de/iiif/2/data%2Fkitodo%2FProdeKoi_507696093_0007%2FProdeKoi_507696093_0007_tif%2Fjpegs%2F00000015.tif.large.jpg/full/full/0/default.jpg"
                      />
                    </a>
                    <figcaption>Seite [ - ]</figcaption>
                  </figure>
                </dd>
                <dt id="event_44711_projects" className="label-projects">
                  Projekte
                </dt>
                <dd className="projects">
                  <a href="https://performance.musiconn.de/projects/internationalisierung-der-symphonik">
                    Internationalisierung der Symphonik
                  </a>
                </dd>
              </dl>
            </dl>
          </div>
        </div>
      </div>
  )
}

export default ContentMain
