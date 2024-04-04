import React from "react";

import LobidAllPropTable from "./LobidAllPropTable";

export default {
  title: "presentation/lobid/LobidAllPropsTable",
  component: LobidAllPropTable,
};

const exampleAllProps = {
  dateOfConferenceOrEvent: ["18.06.2022-25.09.2022"],
  type: ["ConferenceOrEvent", "AuthorityResource"],
  "@context": "http://lobid.org/gnd/context.jsonld",
  gndSubjectCategory: [
    {
      id: "https://d-nb.info/standards/vocab/gnd/gnd-sc#13.1a",
      label: "Bildende Kunst",
    },
  ],
  placeOfConferenceOrEvent: [
    {
      id: "https://d-nb.info/gnd/4029869-3",
      label: "Kassel",
    },
  ],
  geographicAreaCode: [
    {
      id: "https://d-nb.info/standards/vocab/gnd/geographic-area-code#XA-DE-HE",
      label: "Hessen",
    },
  ],
  describedBy: {
    descriptionLevel: {
      id: "https://d-nb.info/standards/vocab/gnd/description-level#1",
      label: "Allgemeines, Interdisziplinäre Allgemeinwörter",
    },
    license: {
      id: "http://creativecommons.org/publicdomain/zero/1.0/",
      label: "http://creativecommons.org/publicdomain/zero/1.0/",
    },
    dateModified: "2022-09-08T05:36:06.000",
    id: "https://d-nb.info/gnd/1257120557/about",
  },
  gndIdentifier: "1257120557",
  id: "https://d-nb.info/gnd/1257120557",
  preferredName: "Documenta (15. : 2022 : Kassel)",
  wikipedia: [
    {
      id: "https://de.wikipedia.org/wiki/Documenta_fifteen",
      label: "https://de.wikipedia.org/wiki/Documenta_fifteen",
    },
  ],
  spatialAreaOfActivity: [
    {
      id: "https://d-nb.info/gnd/4011882-4",
      label: "Deutschland",
    },
  ],
  variantName: ["dOCUMENtA fifteen"],
  homepage: [
    {
      id: "https://documenta-fifteen.de/",
      label: "https://documenta-fifteen.de/",
    },
  ],
  sameAs: [
    {
      id: "http://viaf.org/viaf/4116165272410210690007",
      collection: {
        icon: "http://viaf.org/viaf/images/viaf.ico",
        name: "Virtual International Authority File (VIAF)",
        publisher: "OCLC",
        id: "http://www.wikidata.org/entity/Q54919",
        abbr: "VIAF",
      },
    },
    {
      id: "http://www.wikidata.org/entity/Q48755880",
      collection: {
        icon: "https://www.wikidata.org/static/favicon/wikidata.ico",
        name: "Wikidata",
        publisher: "Wikimedia Foundation Inc.",
        id: "http://www.wikidata.org/entity/Q2013",
        abbr: "WIKIDATA",
      },
    },
    {
      collection: {
        name: "Gemeinsame Normdatei (GND) im Katalog der Deutschen Nationalbibliothek",
        icon: "https://www.dnb.de/SiteGlobals/Frontend/DNBWeb/Images/favicon.png?__blob=normal&v=4",
        publisher: "Deutsche Nationalbibliothek",
        id: "http://www.wikidata.org/entity/Q36578",
        abbr: "DNB",
      },
      id: "https://d-nb.info/gnd/1257120557/about",
    },
    {
      collection: {
        name: "Wikipedia (Deutsch)",
        icon: "https://de.wikipedia.org/static/favicon/wikipedia.ico",
        publisher: "Wikimedia Foundation Inc.",
        id: "http://www.wikidata.org/entity/Q48183",
        abbr: "dewiki",
      },
      id: "https://de.wikipedia.org/wiki/Documenta_fifteen",
    },
    {
      collection: {
        name: "Wikipedia (English)",
        icon: "https://en.wikipedia.org/static/favicon/wikipedia.ico",
        publisher: "Wikimedia Foundation Inc.",
        id: "http://www.wikidata.org/entity/Q328",
        abbr: "enwiki",
      },
      id: "https://en.wikipedia.org/wiki/Documenta_fifteen",
    },
  ],
  depiction: [
    {
      thumbnail:
        "https://commons.wikimedia.org/wiki/Special:FilePath/D15%20-%20ruruHaus%202022-06-16.JPG?width=270",
      id: "https://commons.wikimedia.org/wiki/Special:FilePath/D15%20-%20ruruHaus%202022-06-16.JPG",
      url: "https://commons.wikimedia.org/wiki/File:D15%20-%20ruruHaus%202022-06-16.JPG?uselang=de",
    },
  ],
};
export const LobidAllPropTableDefault = () => (
  <LobidAllPropTable allProps={exampleAllProps} />
);
