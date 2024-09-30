import { DeclarativeMatchBasedFlatMappings } from "@slub/edb-data-mapping";
import namespace from "@rdfjs/namespace";

const BASE_IRI = "http://ontologies.slub-dresden.de/exhibition#";
const sladb = namespace(BASE_IRI);
const gndBaseIRI = "https://d-nb.info/gnd/";
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
      path: "exhibitionGenre",
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
        amount: 1,
        includeRightNeighbours: 1,
      },
    },
    target: {
      path: "locations",
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
        amount: 1,
        includeRightNeighbours: 1,
      },
    },
    target: {
      path: "places",
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
  {
    id: "Ausstellungsenddatum",
    source: {
      columns: {
        title: ["Ausstellungsdatum (...bis) 1"],
        includeRightNeighbours: 3,
      },
    },
    target: {
      path: "endDate",
    },
    mapping: {
      strategy: {
        id: "arrayToAdbDate",
        options: {
          offset: 1,
        },
      },
    },
  },
  {
    id: "Ausstellungsstartdatum",
    source: {
      columns: {
        title: ["Ausstellungsdatum (von...) 1"],
        includeRightNeighbours: 3,
      },
    },
    target: {
      path: "startDate",
    },
    mapping: {
      strategy: {
        id: "arrayToAdbDate",
        options: {
          offset: 1,
        },
      },
    },
  },
] as DeclarativeMatchBasedFlatMappings;
