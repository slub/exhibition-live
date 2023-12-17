import { DeclarativeFlatMappings } from "../utils/mapping/mappingStrategies";
import { sladb } from "../form/formConfigs";
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

export const spreadSheetMapping: (
  fields: OwnColumnDesc[],
) => DeclarativeFlatMappings = (fields) => [
  {
    source: {
      columns: [indexFromTitle("Ausstellungstitel 1", fields)],
    },
    target: {
      path: "title",
    },
  },
  {
    source: {
      columns: [indexFromTitle("Ausstellungstitel 2", fields)],
    },
    target: {
      path: "nameVariant",
    },
  },
  {
    source: {
      columns: [indexFromTitle("Untertitel 1", fields)],
    },
    target: {
      path: "subtitle",
    },
  },
  {
    source: {
      columns: [indexFromTitle("Originaltitel", fields)],
    },
    target: {
      path: "originalTitle",
    },
  },
  {
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
