import { sladb } from "./formConfigs";
import { OwnColumnDesc } from "../google/types";
import { filterUndefOrNull } from "@slub/edb-core-utils";
import { gndBaseIRI } from "@slub/edb-authorities";
import {
  DeclarativeFlatMappings,
  DeclarativeMatchBasedFlatMappings,
  matchBased2DeclarativeFlatMapping,
} from "@slub/edb-data-mapping";

/*
B:Name Kiste
C:Medientyp (Konvulut)
D:Ressourcentyp
E:Titel (Konvulut)
F:Beschreibung Konvolut
G:Ausstellungstitel
H:Untertitel
I:Ausstellung (GND)
J:Ausstellungstyp
K:Ausstellungskategorie
L:Serie/Veranstaltungsreihe
M:Serie/Veranstaltungsreihe (GND)
N:Genre 1
O:Genre 1 (GND)
P:Genre 2
Q:Genre 2 (GND)
R:Genre 3
S:Genre 3 (GND)
T:Genre 4
U:Genre 4 (GND)
V:Genre 5
W:Genre 5 (GND)
X:Ort der Ausstellung (geografisch) 1
Y:Ort der Ausstellung (geografisch) 1 (GND)
Z:Ort der Ausstellung (geografisch) 2
BA:Ort der Ausstellung (geografisch) 2 (GND)
BB:Ort der Ausstellung (geografisch) 3
BC:Ort der Ausstellung (geografisch) 3 (GND)
BD:Ort der Ausstellung (geografisch) 4
BE:Ort der Ausstellung (geografisch) 4 (GND)
BF:Ort der Ausstellung (Institution) 1
BG:Ort der Ausstellung (Institution) (GND)1
BH:Ort der Ausstellung (Institution) 2
BI:Ort der Ausstellung (Institution) 3
BJ:Ort der Ausstellung (Institution) 4
BK:Ort der Ausstellung (Institution) 5
BL:Ort der Ausstellung (Institution) 6
BM:Ort der Ausstellung (Institution) 7
BN:Aktuell Ort der Ausstellung (Institution) 1
BO:Aktuell Ort der Ausstellung (Institution) 2
BP:Aktuell Ort der Ausstellung (Institution) 3
BQ:Erscheinungsort
BR:Originaltitel
BS:Beteiligte Person 1 (Name)
BT:Beteiligte Person 1 (GND-Nummer)
BU:Beteiligte Person 1 (Rolle 1)
BV:Beteiligte Person 1 (Rolle 2)
BW:Beteiligte Person 2 (Name)
BX:Beteiligte Person 2 (GND-Nummer)
BY:Beteiligte Person 2 (Rolle 1)
BZ:Beteiligte Person 3
CA:Rolle
CB:Beteiligte Person 4
CC:Rolle
CD:Beteiligte Person 5
CE:Rolle
CF:Beteiligte Person 6
CG:Rolle
CH:Beteiligte Person 7
CI:Rolle
CJ:Beteiligte Person 7
CK:Rolle
CL:Beteiligte Person 8
CM:Rolle
CN:Beteiligte Person 9
CO:Rolle
CP:Beteiligte Person 10
CQ:Rolle
CR:Beteiligte Person 11
CS:Rolle
CT:Beteiligte Person 12
CU:Rolle
CV:Beteiligte Person 13
CW:Rolle
CX:Beteiligte Person 14
CY:Rolle
CZ:Beteiligte Person 15
DA:Rolle
DB:Beteiligte Person 16
DC:Rolle
DD:Beteiligte Person 17
DE:Rolle
DF:Beteiligte Person 18
DG:Rolle
DH:Beteiligte Person 19
DI:Rolle
DJ:Beteiligte Person 20
DK:Rolle
DL:Beteiligte Person 21
DM:Rolle
DN:Beteiligte Person 22
DO:Rolle
DP:Beteiligte Person 23
DQ:Rolle
DR:Beteiligte Person 24
DS:Rolle
DT:Beteiligte Person 25
DU:Rolle
DV:Beteiligte Person 26
DW:Rolle
DX:Beteiligte Person 27
DY:Rolle
DZ:Beteiligte Person 28
EA:Rolle
EB:Beteiligte Person 29
EC:Rolle
ED:Beteiligte Person 30
EE:Rolle
EF:Beteiligte Person 31
EG:Rolle
EH:Beteiligte Person 32
EI:Rolle
EJ:Beteiligte Person 33
EK:Rolle
EL:Beteiligte Person 34
EM:Rolle
EN:Beteiligte Person 35
EO:Rolle
EP:Beteiligte Person 36
EQ:GND
ER:Rolle
ES:Beteiligte Körperschaft 1
ET:Rolle
EU:Beteiligte Körperschaft 2
EV
EW:Viaf
EX:Rolle
EY:Beteiligte Körperschaft 3
EZ:Rolle
FA:Beteiligte Körperschaft 4
FB:Rolle
FC:Beteiligte Körperschaft 5
FD:Rolle
FE:Beteiligte Körperschaft 6
FF:Rolle
FG:Beteiligte Körperschaft 7
FH:Rolle
FI:Beteiligte Körperschaft 8
FJ:Rolle
FK:Aktuell Beteiligte Körperschaft 1
FL:Aktuell Beteiligte Körperschaft 2
FM:Aktuell Beteiligte Körperschaft 3
FN:Zusatz Beteiligte Körperschaft 1
FO:Datierung
FP:Widmung F. C. Gundlach
FQ:Widmung Andere
FR:Ausstellungsdatum (von...) 1
FS:Tag
FT:Monat
FU:Jahr
FV:Ausstellungsdatum (...bis) 1
FW:Tag
FX:Monat
FY:Jahr
FZ:Weitere Datumsangaben (Vernissage, Finissage, ...) 1
GA:Tag
GB:Monat
GC:Jahr
GD:Ausstellungsdatum (von...) 2
GE:Tag
GF:Monat
GG:Jahr
GH:Ausstellungsdatum (...bis) 2
GI:Tag
GJ:Monat
GK:Jahr
GL:Weitere Datumsangaben (Vernissage, Finissage, ...) 2
GM:Tag
GN:Monat
GO:Jahr
GP:Ausstellungsdatum (von...) 3
GQ:Tag
GR:Monat
GS:Jahr
GT:Ausstellungsdatum (...bis) 3
GU:Tag
GV:Monat
GW:Jahr
GX:Weitere Datumsangaben (Vernissage, Finissage, ...) 3
GY:Tag
GZ:Monat
HA:Jahr
HB:Umfang
HC:Schlagwort 1
HD:Schlagwort 2
HE:Schlagwörter 3
HF:Schlagwörter 4
HG:Schlagwort 5
HH:Schlagwort 6
HI:Beschreibung
HJ:Sprache 1
HK:Sprache 2
HL:Sprache 3
HM:Signatur
HN:RVK-Notation
HO:K10PlusPPN
HP:SWB-ID
HQ:Sachgebiet/SSG Nummer/FID-Kennzeichen
HR:Permalink
HS:DOI-Digitalisat
HT:Weblink/URL
HU:Ressource

 */

export const matchBasedSpreadsheetMappings_NewYork = [
  {
    id: "Ausstellungstitel",
    source: {
      columns: {
        title: ["Ausstellungstitel 1"],
      },
    },
    target: {
      path: "title",
    },
  },
  {
    id: "Genre",
    source: {
      columns: {
        titlePattern: "Genre {{=it.i + 1}}",
        amount: 5,
        includeRightNeighbours: 1,
      },
    },
    target: {
      path: "genre",
    },
    mapping: {
      strategy: {
        id: "createEntityWithAuthoritativeLink",
        options: {
          typeIRI: sladb("Genre").value,
          typeName: "Genre",
          mainProperty: {
            offset: 0,
          },
          authorityFields: [
            {
              offset: 1,
              authorityLinkPrefix: gndBaseIRI,
            },
          ],
        },
      },
    },
  },
  {
    id: "geografischer Ort",
    source: {
      columns: {
        titlePattern: "Ort der Ausstellung (geografisch) {{=it.i + 1}}",
        amount: 4,
        includeRightNeighbours: 1,
      },
    },
    target: {
      path: "location",
    },
    mapping: {
      strategy: {
        id: "createEntityWithAuthoritativeLink",
        options: {
          typeIRI: sladb("Location").value,
          typeName: "Location",
          mainProperty: {
            offset: 0,
          },
          authorityFields: [
            {
              offset: 1,
              authorityLinkPrefix: gndBaseIRI,
            },
          ],
        },
      },
    },
  },
  {
    id: "institutioneller Ort",
    source: {
      columns: {
        titlePattern: "Ort der Ausstellung (Institution) {{=it.i + 1}}",
        amount: 7,
      },
    },
    target: {
      path: "place",
    },
    mapping: {
      strategy: {
        id: "createEntityWithAuthoritativeLink",
        options: {
          typeIRI: sladb("Place").value,
          typeName: "Place",
          mainProperty: {
            offset: 0,
          },
          authorityFields: [
            {
              offset: 1,
              authorityLinkPrefix: gndBaseIRI,
            },
          ],
        },
      },
    },
  },
  {
    id: "Beteiligte Person",
    source: {
      columns: {
        titlePattern: "Beteiligte Person {{=it.i + 3}}",
        amount: 22,
        includeRightNeighbours: 1,
      },
    },
    target: {
      path: "involvedPersons",
    },
    mapping: {
      strategy: {
        id: "createEntityWithReificationFromString",
        options: {
          typeIRI: sladb("InvolvedPerson").value,
          typeName: "InvolvedPerson",
          mainProperty: {
            property: "person",
            offset: 0,
            mapping: {
              strategy: {
                id: "createEntityFromString",
                options: {
                  typeIRI: sladb("Person").value,
                  typeName: "Person",
                },
              },
            },
          },
          statementProperties: [
            {
              property: "role",
              offset: 1,
              mapping: {
                strategy: {
                  id: "createEntityFromString",
                  options: {
                    typeIRI: sladb("PersonRole").value,
                    typeName: "PersonRole",
                  },
                },
              },
            },
          ],
        },
      },
    },
  },
  {
    id: "Beteiligte Person GND",
    source: {
      columns: {
        titlePattern: "Beteiligte Person {{=it.i + 1}} (Name)",
        amount: 4,
        includeRightNeighbours: 3,
      },
    },
    target: {
      path: "involvedPersons",
    },
    mapping: {
      strategy: {
        id: "createEntityWithReificationFromString",
        options: {
          typeIRI: sladb("InvolvedPerson").value,
          typeName: "InvolvedPerson",
          mainProperty: {
            property: "person",
            mapping: {
              strategy: {
                id: "createEntityWithAuthoritativeLink",
                options: {
                  typeIRI: sladb("Person").value,
                  typeName: "Person",
                  mainProperty: {
                    offset: 0,
                  },
                  authorityFields: [
                    {
                      offset: 1,
                      authorityLinkPrefix: gndBaseIRI,
                    },
                  ],
                },
              },
            },
          },
          statementProperties: [
            {
              property: "role",
              offset: 2,
              mapping: {
                strategy: {
                  id: "createEntityFromString",
                  options: {
                    typeIRI: sladb("PersonRole").value,
                    typeName: "PersonRole",
                  },
                },
              },
            },
          ],
        },
      },
    },
  },
  {
    id: "Beteiligte Körperschaft",
    source: {
      columns: {
        titlePattern: "Beteiligte Körperschaft {{=it.i + 3}}",
        amount: 6,
        includeRightNeighbours: 1,
      },
    },
    target: {
      path: "involvedCorporations",
    },
    mapping: {
      strategy: {
        id: "createEntityWithReificationFromString",
        options: {
          typeIRI: sladb("InvolvedCorporation").value,
          typeName: "InvolvedCorporation",
          mainProperty: {
            property: "corporation",
          },
          statementProperties: [
            {
              property: "role",
              mapping: {
                strategy: {
                  id: "createEntityFromString",
                  options: {
                    typeIRI: sladb("CorporationRole").value,
                    typeName: "CorporationRole",
                  },
                },
              },
            },
          ],
        },
      },
    },
  },
] as DeclarativeMatchBasedFlatMappings;

export const spreadSheetMappings_NewYork: (
  fields: OwnColumnDesc[],
) => DeclarativeFlatMappings = (fields) =>
  filterUndefOrNull(
    matchBasedSpreadsheetMappings_NewYork.map((mapping) => {
      let declarativeFlatMapping = null;
      try {
        declarativeFlatMapping = matchBased2DeclarativeFlatMapping(
          fields,
          mapping,
        );
      } catch (e) {
        console.error(`Error while creating mapping for ${mapping.id}`, e);
      }
      return declarativeFlatMapping;
    }),
  );
