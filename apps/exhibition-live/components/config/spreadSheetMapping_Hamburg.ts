import { DeclarativeFlatMappings } from "@slub/edb-ui-utils";
import { sladb } from "./formConfigs";
import { OwnColumnDesc } from "../google/types";

export const indexFromLetter = (
  letter: string,
  fields: OwnColumnDesc[],
): number => {
  const index = fields.findIndex((m) => m.letter === letter);
  if (index === -1) {
    throw new Error(`No index for letter ${letter}`);
  }
  return index;
};

export const indexFromTitle = (
  title: string,
  fields: OwnColumnDesc[],
): number => {
  const index = fields.findIndex((m) => m.value === title);
  if (index === -1) {
    throw new Error(`No index for title ${title}`);
  }
  return index;
};

export const spreadSheetMapping_Hamburg: (
  fields: OwnColumnDesc[],
) => DeclarativeFlatMappings = (fields) => [
  {
    id: "Ausstellungstitel 1",
    source: {
      columns: [indexFromTitle("Ausstellungstitel 1", fields)],
    },
    target: {
      path: "title",
    },
  },
  {
    id: "Ausstellungstitel 2",
    source: {
      columns: [indexFromTitle("Ausstellungstitel 2", fields)],
    },
    target: {
      path: "nameVariant",
    },
  },
  {
    id: "Untertitel",
    source: {
      columns: [indexFromTitle("Untertitel 1", fields)],
    },
    target: {
      path: "subtitle",
    },
  },
  {
    id: "Originaltitel",
    source: {
      columns: [indexFromTitle("Originaltitel", fields)],
    },
    target: {
      path: "originalTitle",
    },
  },
  {
    id: "Genre",
    source: {
      columns: [...Array(5)].map((_, i) =>
        indexFromTitle(`Genre ${i + 1}`, fields),
      ),
    },
    target: {
      path: "genre",
    },
    mapping: {
      strategy: {
        id: "createEntityFromString",
        options: {
          typeIRI: sladb("Genre").value,
          typeName: "Genre",
        },
      },
    },
  },

  {
    id: "geografischer Ort",
    source: {
      columns: [indexFromTitle("Ort der Ausstellung (geografisch) 1", fields)],
    },
    target: {
      path: "location",
    },
    mapping: {
      strategy: {
        id: "createEntityFromString",
        options: {
          typeIRI: sladb("Location").value,
          typeName: "Location",
        },
      },
    },
  },
  {
    id: "institutioneller Ort",
    source: {
      columns: [...Array(7)].map((_, index) =>
        indexFromTitle(
          `Ort der Ausstellung (Institution) ${index + 1}`,
          fields,
        ),
      ),
    },
    target: {
      path: "places",
    },
    mapping: {
      strategy: {
        id: "createEntityFromString",
        options: {
          typeIRI: sladb("Place").value,
          typeName: "Place",
        },
      },
    },
  },
  {
    id: "beteiligte Person",
    source: {
      columns: [...Array(118)].flatMap((_, index) => {
        const firstIndex = indexFromTitle(
          `Beteiligte Person ${index + 1}`,
          fields,
        );
        return [firstIndex, firstIndex + 1];
      }),
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
    id: "beteiligte Körperschaft",
    source: {
      columns: [...Array(7)].flatMap((_, index) => {
        const firstIndex = indexFromTitle(
          `Beteiligte Körperschaft ${index + 1}`,
          fields,
        );
        return [firstIndex, firstIndex + 1];
      }),
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
            offset: 0,
            mapping: {
              strategy: {
                id: "createEntityFromString",
                options: {
                  typeIRI: sladb("Corporation").value,
                  typeName: "Corporation",
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
    id: "Schlagwort",
    source: {
      columns: [indexFromTitle("Schlagwörter", fields)],
    },
    target: {
      path: "tags",
    },
    mapping: {
      strategy: {
        id: "split",
        options: {
          separator: ",",
          mapping: {
            strategy: {
              id: "createEntityFromString",
              options: {
                typeIRI: sladb("Tag").value,
                typeName: "Tag",
              },
            },
          },
        },
      },
    },
  },
  {
    id: "Ausstellungsdatum von",
    source: {
      columns: [...Array(3)].map(
        (_, index) =>
          indexFromTitle("Ausstellungsdatum (von...) 1", fields) + index + 1,
      ),
    },
    target: {
      path: "startDate.dateValue",
    },
    mapping: {
      strategy: {
        id: "dateArrayToSpecialInt",
      },
    },
  },
  {
    id: "Ausstellungsdatum bis",
    source: {
      columns: [...Array(3)].map(
        (_, index) =>
          indexFromTitle("Ausstellungsdatum (...bis) 1", fields) + index + 1,
      ),
    },
    target: {
      path: "endDate.dateValue",
    },
    mapping: {
      strategy: {
        id: "dateArrayToSpecialInt",
      },
    },
  },
];
