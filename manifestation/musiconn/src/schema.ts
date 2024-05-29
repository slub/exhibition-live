import { JSONSchema7 } from "json-schema";

export const schema: JSONSchema7 = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://performance.musiconn.de/schema",
  $defs: {
    Authority: {
      type: "object",
      properties: {
        uid: {
          type: "integer",
        },
        title: {
          type: "string",
          maxLength: 1024,
        },
        slug: {
          type: "string",
          maxLength: 1024,
        },
        score: {
          type: "integer",
        },
        state: {
          type: "integer",
        },
        categories: {
          type: "integer",
          title: "Kategorien",
          oneOf: [
            {
              const: 1,
              title: "Normdaten (Gemeinsame Normdatei)",
            },
            {
              const: 2,
              title: "Normdaten (Wikidata)",
            },
            {
              const: 3,
              title: "Normdaten (Virtual International Authority File)",
            },
            {
              const: 4,
              title: "Normdaten (Library of Congress Control Number)",
            },
            {
              const: 5,
              title: "Normdaten (GeoNames)",
            },
            {
              const: 6,
              title: "Normdaten (International Standard Name Identifier)",
            },
            {
              const: 6,
              title: "Normdaten (DBpedia)",
            },
          ],
        },
        names: {
          type: "array",
          items: {
            type: "object",
            properties: {
              order: {
                type: "integer",
              },
              name: {
                type: "string",
                maxLength: 1024,
              },
            },
            required: ["order", "name"],
          },
        },
        descriptions: {
          type: "string",
          maxLength: 1024,
        },
      },
    },
    Corporation: {
      type: "object",
      properties: {
        uid: {
          type: "integer",
        },
        title: {
          type: "string",
          maxLength: 1024,
        },
        slug: {
          type: "string",
          maxLength: 1024,
        },
        score: {
          type: "integer",
        },
        state: {
          type: "integer",
        },
        categories: {
          type: "integer",
          title: "Kategorien",
          oneOf: [
            {
              const: 1,
              title: "Körperschaft",
            },
            {
              const: 2,
              title: "Orchester",
            },
            {
              const: 3,
              title: "Chor",
            },
            {
              const: 4,
              title: "Ensemble",
            },
          ],
        },
        names: {
          type: "array",
          items: {
            type: "object",
            properties: {
              order: {
                type: "integer",
              },
              name: {
                type: "string",
                maxLength: 1024,
              },
            },
          },
          required: ["order", "name"],
        },
        descriptions: {
          type: "string",
          maxLength: 1024,
        },
        parents: {
          type: "array",
          title: "Hierarchisch Übergeordnet",
          items: {
            $ref: "#/$defs/Corporation",
          },
        },
        locations: {
          type: "array",
          title: "Wirkungsort",
          items: {
            $ref: "#/$defs/Location",
          },
        },
        authorities: {
          type: "array",
          title: "Normdaten",
          items: {
            $ref: "#/$defs/Authority",
          },
        },
      },
    },
    Event: {
      type: "object",
      properties: {
        uid: {
          type: "integer",
        },
        title: {
          type: "string",
          maxLength: 1024,
        },
        slug: {
          type: "string",
          maxLength: 1024,
        },
        score: {
          type: "integer",
        },
        state: {
          type: "integer",
        },
        categories: {
          type: "integer",
          title: "Kategorien",
          oneOf: [
            {
              const: 1,
              title: "Musiktheaterveranstaltung",
            },
            {
              const: 2,
              title: "Konzertveranstaltung",
            },
            {
              const: 3,
              title: "Religiöse Veranstaltung",
            },
            {
              const: 4,
              title: "Sonstige Veranstaltung",
            },
            {
              const: 5,
              title: "Rundfunkausstrahlung",
            },
            {
              const: 6,
              title: "Konzertante Aufführung",
            },
          ],
        },
        names: {
          type: "array",
          items: {
            type: "object",
            properties: {
              order: {
                type: "integer",
              },
              name: {
                type: "string",
                maxLength: 1024,
              },
            },
          },
          required: ["order", "name"],
        },
        descriptions: {
          type: "string",
          maxLength: 1024,
        },
        locations: {
          type: "array",
          items: {
            $ref: "#/$defs/Location",
          },
        },
        dates: {
          type: "array",
          items: {
            type: "object",
            properties: {
              modifier: {
                type: "integer",
                oneOf: [
                  {
                    const: 1,
                    title: "Beginn",
                  },
                  {
                    const: 2,
                    title: "Beginn vor",
                  },
                  {
                    const: 3,
                    title: "Beginn nach",
                  },
                  {
                    const: 4,
                    title: "Beginn ca.",
                  },
                ],
              },
              date: {
                type: "string",
                format: "date",
              },
            },
            required: ["date"],
          },
        },
      },
    },
    Location: {
      type: "object",
      properties: {
        uid: {
          type: "integer",
        },
        title: {
          type: "string",
          maxLength: 1024,
        },
        slug: {
          type: "string",
          maxLength: 1024,
        },
        score: {
          type: "integer",
        },
        state: {
          type: "integer",
        },
        categories: {
          type: "integer",
          title: "Kategorien",
          oneOf: [
            {
              const: 1,
              title: "Ort",
            },
            {
              const: 2,
              title: "Kontinent",
            },
            {
              const: 3,
              title: "Staat / Land",
            },
            {
              const: 4,
              title: "Bundesland / Bundesstaat",
            },
            {
              const: 5,
              title: "Stadt / Gemeinde",
            },
            {
              const: 6,
              title: "Stadtteil",
            },
            {
              const: 7,
              title: "Veranstaltungsort / Gebäude",
            },
            {
              const: 8,
              title: "Veranstaltungsraum / Bühne",
            },
          ],
        },
        names: {
          type: "array",
          items: {
            type: "object",
            properties: {
              order: {
                type: "integer",
              },
              name: {
                type: "string",
                maxLength: 1024,
              },
            },
          },
        },
        descriptions: {
          type: "string",
          maxLength: 1024,
        },
        parents: {
          type: "array",
          title: "Hierarchisch Übergeordnet",
          items: {
            $ref: "#/$defs/Location",
          },
        },
      },
    },
    Performance: {
      type: "object",
      properties: {
        uid: {
          type: "integer",
        },
        title: {
          type: "string",
          maxLength: 1024,
        },
        slug: {
          type: "string",
          maxLength: 1024,
        },
        score: {
          type: "integer",
        },
        state: {
          type: "integer",
        },
        categories: {
          type: "integer",
          title: "Kategorien",
          oneOf: [
            {
              const: 1,
              title: "Aufführung",
            },
            {
              const: 2,
              title: "Uraufführung",
            },
            {
              const: 3,
              title: "Zugabe",
            },
          ],
        },
        names: {
          type: "array",
          items: {
            type: "object",
            properties: {
              order: {
                type: "integer",
              },
              name: {
                type: "string",
                maxLength: 1024,
              },
              descriptions: {
                type: "string",
                maxLength: 1024,
              },
            },
            required: ["order", "name"],
          },
        },
      },
    },
    Person: {
      type: "object",
      properties: {
        uid: {
          type: "integer",
        },
        title: {
          type: "string",
          maxLength: 1024,
        },
        slug: {
          type: "string",
          maxLength: 1024,
        },
        score: {
          type: "integer",
        },
        state: {
          type: "integer",
        },
        categories: {
          type: "integer",
          title: "Kategorien",
          oneOf: [
            {
              const: 1,
              title: "Person",
            },
            {
              const: 2,
              title: "Komponist*in",
            },
            {
              const: 3,
              title: "Dirigent*in",
            },
            {
              const: 4,
              title: "Instrumentalist*in",
            },
            {
              const: 5,
              title: "Vokalist*in",
            },
            {
              const: 6,
              title: "Librettist*in",
            },
          ],
        },
        names: {
          type: "array",
          items: {
            type: "object",
            properties: {
              order: {
                type: "integer",
              },
              name: {
                type: "string",
                maxLength: 1024,
              },
            },
            required: ["order", "name"],
          },
        },
        descriptions: {
          type: "string",
          maxLength: 1024,
        },
      },
    },
    Series: {
      type: "object",
      properties: {
        uid: {
          type: "integer",
        },
        title: {
          type: "string",
          maxLength: 1024,
        },
        slug: {
          type: "string",
          maxLength: 1024,
        },
        score: {
          type: "integer",
        },
        state: {
          type: "integer",
        },
        categories: {
          type: "integer",
          title: "Kategorien",
          oneOf: [
            {
              const: 1,
              title: "Veranstaltungsreihe",
            },
            {
              const: 2,
              title: "Saison",
            },
            {
              const: 3,
              title: "Tournee",
            },
            {
              const: 4,
              title: "Veranstaltungszyklus",
            },
            {
              const: 5,
              title: "Musikfestival",
            },
            {
              const: 6,
              title: "Feiertagskonzerte",
            },
          ],
        },
        names: {
          type: "array",
          items: {
            type: "object",
            properties: {
              order: {
                type: "integer",
              },
              name: {
                type: "string",
                maxLength: 1024,
              },
            },
            required: ["order", "name"],
          },
        },
        descriptions: {
          type: "string",
          maxLength: 1024,
        },
        parents: {
          type: "array",
          title: "Hierarchisch Übergeordnet",
          items: {
            $ref: "#/$defs/Series",
          },
        },
      },
    },
    Source: {
      type: "object",
      properties: {
        uid: {
          type: "integer",
        },
        title: {
          type: "string",
          maxLength: 1024,
        },
        slug: {
          type: "string",
          maxLength: 1024,
        },
        score: {
          type: "integer",
        },
        state: {
          type: "integer",
        },
        categories: {
          type: "integer",
          title: "Kategorien",
          oneOf: [
            {
              const: 1,
              title: "Sekundärliteratur",
            },
            {
              const: 2,
              title: "Primärquelle",
            },
            {
              const: 3,
              title: "Programm",
            },
            {
              const: 4,
              title: "Rezension",
            },
            {
              const: 5,
              title: "Vorankündigung",
            },
            {
              const: 6,
              title: "Ticket",
            },
            {
              const: 7,
              title: "Brief",
            },
            {
              const: 8,
              title: "Tagebuch",
            },
            {
              const: 9,
              title: "Fotographie",
            },
            {
              const: 10,
              title: "Audioaufnahme",
            },
            {
              const: 11,
              title: "Videoaufnahme",
            },
            {
              const: 12,
              title: "Zeitschrift",
            },
            {
              const: 13,
              title: "Flyer",
            },
            {
              const: 14,
              title: "Plakat",
            },
            {
              const: 15,
              title: "Merchandise",
            },
            {
              const: 16,
              title: "Sonstiges",
            },
            {
              const: 17,
              title: "Besetzungszettel",
            },
            {
              const: 18,
              title: "Konzertzettel",
            },
            {
              const: 19,
              title: "Theaterzettel",
            },
            {
              const: 20,
              title: "Datenbank",
            },
            {
              const: 21,
              title: "Katalogisat",
            },
            {
              const: 22,
              title: "Zeitschriftenbeitrag",
            },
          ],
        },
        names: {
          type: "array",
          items: {
            type: "object",
            properties: {
              order: {
                type: "integer",
              },
              name: {
                type: "string",
                maxLength: 1024,
              },
            },
          },
          required: ["order", "name"],
        },
        descriptions: {
          type: "string",
          maxLength: 1024,
        },
        parents: {
          type: "array",
          title: "Hierarchisch Übergeordnet",
          items: {
            $ref: "#/$defs/Source",
          },
        },
      },
    },
    Subject: {
      type: "object",
      properties: {
        uid: {
          type: "integer",
        },
        title: {
          type: "string",
          maxLength: 1024,
        },
        slug: {
          type: "string",
          maxLength: 1024,
        },
        score: {
          type: "integer",
        },
        state: {
          type: "integer",
        },
        categories: {
          type: "integer",
          title: "Kategorien",
          oneOf: [
            {
              const: 1,
              title: "Schlagwort",
            },
            {
              const: 2,
              title: "Beruf / Tätigkeit",
            },
            {
              const: 3,
              title: "Form / Gattung",
            },
            {
              const: 4,
              title: "Besetzungsangabe",
            },
            {
              const: 5,
              title: "Beitragsart (Körperschaft)",
            },
            {
              const: 6,
              title: "Beitragsart (Person)",
            },
          ],
        },
        names: {
          type: "array",
          items: {
            type: "object",
            properties: {
              order: {
                type: "integer",
              },
              name: {
                type: "string",
                maxLength: 1024,
              },
            },
            required: ["order", "name"],
          },
        },
        descriptions: {
          type: "string",
          maxLength: 1024,
        },
        parents: {
          type: "array",
          title: "Hierarchisch Übergeordnet",
          items: {
            $ref: "#/$defs/Subject",
          },
        },
      },
    },
    Work: {
      type: "object",
      properties: {
        uid: {
          type: "integer",
        },
        title: {
          type: "string",
          maxLength: 1024,
        },
        slug: {
          type: "string",
          maxLength: 1024,
        },
        score: {
          type: "integer",
        },
        state: {
          type: "integer",
        },
        categories: {
          type: "integer",
          title: "Kategorien",
          oneOf: [
            {
              const: 1,
              title: "Werk",
            },
            {
              const: 2,
              title: "Werkteil",
            },
            {
              const: 3,
              title: "Fassung",
            },
          ],
        },
        names: {
          type: "array",
          items: {
            type: "object",
            properties: {
              order: {
                type: "integer",
              },
              name: {
                type: "string",
                maxLength: 1024,
              },
            },
            required: ["order", "name"],
          },
        },
        descriptions: {
          type: "string",
          maxLength: 1024,
        },
        parents: {
          type: "array",
          title: "Hierarchisch Übergeordnet",
          items: {
            $ref: "#/$defs/Work",
          },
        },
      },
    },
  },
};
