import { JSONSchema7 } from "json-schema";
import { extendDefinitionsWithProperties } from "@slub/json-schema-utils";
import { schemaExpander } from "./makeStubSchema";

export const schemaName = "exhibition";

const rawSchema: JSONSchema7 = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://schema.adb.arthistoricum.net/exhibition#v1",
  title: "SLUB Ausstellungsdatenbank",
  $defs: {
    Tag: {
      type: "object",
      properties: {
        title: {
          type: "string",
          maxLength: 200,
        },
        description: {
          type: "string",
        },
        image: {
          type: "string",
          format: "uri",
        },
        parent: {
          title: "Übergeordnetes Schlagwort",
          $ref: "#/$defs/Tag",
        },
      },
    },
    Occupation: {
      type: "object",
      properties: {
        title: {
          type: "string",
          maxLength: 200,
        },
        description: {
          type: "string",
        },
        parent: {
          title: "Übergeordneter Beruf",
          $ref: "#/$defs/Occupation",
        },
      },
    },
    SeriesType: {
      type: "object",
      properties: {
        title: {
          type: "string",
          maxLength: 200,
        },
        description: {
          type: "string",
        },
      },
    },
    ExhibitionSeries: {
      type: "object",
      properties: {
        title: {
          type: "string",
          maxLength: 200,
        },
        description: {
          type: "string",
        },
        parent: {
          title: "Übergeordnete Ausstellungsreihe",
          $ref: "#/$defs/ExhibitionSeries",
        },
        seriesType: {
          $ref: "#/$defs/SeriesType",
        },
        timeSeries: {
          type: "string",
          maxLength: 200,
        },
        location: {
          $ref: "#/$defs/Location",
        },
        tags: {
          type: "array",
          items: {
            $ref: "#/$defs/Tag",
          },
        },
      },
    },
    Person: {
      type: "object",
      properties: {
        name: {
          type: "string",
          maxLength: 200,
        },
        description: {
          type: "string",
        },
        birthDate: {
          type: "integer",
        },
        deathDate: {
          type: "integer",
        },
        profession: {
          type: "array",
          items: {
            $ref: "#/$defs/Occupation",
          },
        },
        nameVariant: {
          type: "array",
          items: {
            type: "string",
          },
        },
        gender: {
          type: "string",
          maxLength: 1,
          oneOf: [
            {
              const: "m",
              title: "männlich",
            },
            {
              const: "f",
              title: "weiblich",
            },
            {
              const: "d",
              title: "divers",
            },
            {
              const: "u",
              title: "unbekannt",
            },
          ],
        },
        personDeceased: {
          type: "boolean",
        },
        externalId: {
          type: "string",
          maxLength: 50,
        },
        workplace: {
          type: "array",
          items: {
            $ref: "#/$defs/Workplace",
          },
        },
        memberOfCorp: {
          type: "array",
          items: {
            $ref: "#/$defs/Corporation",
          },
        },
        image: {
          type: "string",
          format: "uri",
        },
      },
    },
    Workplace: {
      type: "object",
      properties: {
        location: {
          $ref: "#/$defs/Location",
        },
        fromDate: {
          type: "integer",
        },
        toDate: {
          type: "integer",
        },
      },
    },
    Location: {
      type: "object",
      properties: {
        title: {
          type: "string",
          maxLength: 200,
        },
        titleVariants: {
          type: "string",
          maxLength: 600,
        },
        description: {
          type: "string",
        },
        image: {
          type: "string",
          format: "uri",
        },
        parent: {
          title: "Übergeordneter Ort",
          $ref: "#/$defs/Location",
        },
      },
    },
    PersonRole: {
      type: "object",
      properties: {
        title: {
          type: "string",
          maxLength: 200,
        },
        description: {
          type: "string",
        },
      },
    },
    CorporationRole: {
      type: "object",
      properties: {
        title: {
          type: "string",
          maxLength: 200,
        },
        description: {
          type: "string",
        },
      },
    },
    Place: {
      type: "object",
      properties: {
        title: {
          type: "string",
          maxLength: 200,
        },
        description: {
          type: "string",
        },
        titleVariants: {
          type: "string",
          maxLength: 600,
        },
        location: {
          $ref: "#/$defs/Location",
        },
        parent: {
          title: "Übergeordnete Stätte",
          $ref: "#/$defs/Place",
        },
        image: {
          type: "string",
          format: "uri",
        },
      },
    },
    EventType: {
      type: "object",
      properties: {
        title: {
          type: "string",
          maxLength: 200,
        },
        description: {
          type: "string",
        },
      },
    },
    Corporation: {
      type: "object",
      properties: {
        name: {
          type: "string",
          maxLength: 200,
        },
        description: {
          type: "string",
        },
        nameVariant: {
          type: "array",
          items: {
            type: "string",
          },
        },
        parent: {
          title: "Übergeordnete Organisation",
          $ref: "#/$defs/Corporation",
        },
        location: {
          $ref: "#/$defs/Location",
        },
        image: {
          type: "string",
          format: "uri",
        },
      },
    },
    ResourceType: {
      type: "object",
      properties: {
        title: {
          type: "string",
          maxLength: 200,
        },
        description: {
          type: "string",
        },
      },
    },
    Resource: {
      type: "object",
      properties: {
        title: {
          type: "string",
          maxLength: 200,
        },
        description: {
          type: "string",
        },
        ppn: {
          type: "string",
          maxLength: 15,
        },
        doi: {
          type: "string",
        },
        url: {
          type: "string",
          format: "uri",
        },
        ressourceType: {
          $ref: "#/$defs/ResourceType",
        },
        signature: {
          type: "string",
          maxLength: 200,
        },
        image: {
          type: "string",
          format: "uri",
        },
      },
    },
    ExponatsAndPersons: {
      type: "object",
      properties: {
        person: {
          $ref: "#/$defs/Person",
        },
        role: {
          $ref: "#/$defs/PersonRole",
        },
      },
    },
    ExponatsAndCorporations: {
      type: "object",
      properties: {
        corporation: {
          $ref: "#/$defs/Corporation",
        },
        role: {
          $ref: "#/$defs/CorporationRole",
        },
      },
    },
    ExhibitionExponat: {
      type: "object",
      properties: {
        title: {
          type: "string",
          maxLength: 500,
        },
        titleVariants: {
          type: "string",
          maxLength: 600,
        },
        description: {
          type: "string",
        },
        externalId: {
          type: "string",
          maxLength: 200,
        },
        startDate: {
          type: "object",
          properties: {
            dateValue: {
              type: "integer",
              title: "Datumswert",
              maxLength: 8,
            },
            dateModifier: {
              type: "integer",
              title: "Art der Zeitangabe",
              oneOf: [
                {
                  const: 0,
                  title: "exakt",
                },
                {
                  const: 1,
                  title: "ca.",
                },
                {
                  const: 2,
                  title: "vor",
                },
                {
                  const: 3,
                  title: "nach",
                },
              ],
            },
          },
        },
        endDate: {
          type: "object",
          properties: {
            dateValue: {
              type: "integer",
              title: "Datumswert",
              maxLength: 8,
            },
            dateModifier: {
              type: "integer",
              title: "Art der Zeitangabe",
              oneOf: [
                {
                  const: 0,
                  title: "exakt",
                },
                {
                  const: 1,
                  title: "ca.",
                },
                {
                  const: 2,
                  title: "vor",
                },
                {
                  const: 3,
                  title: "nach",
                },
              ],
            },
          },
        },
        url: {
          type: "string",
          format: "uri",
        },
        signature: {
          type: "string",
          maxLength: 200,
        },
        exponatGenres: {
          type: "array",
          items: {
            $ref: "#/$defs/Genre",
          },
        },
        relatedPersons: {
          type: "array",
          items: {
            $ref: "#/$defs/ExponatsAndPersons",
          },
        },
        relatedCorporations: {
          type: "array",
          items: {
            $ref: "#/$defs/ExponatsAndCorporations",
          },
        },
        resources: {
          type: "array",
          items: {
            $ref: "#/$defs/Resource",
          },
        },
      },
    },
    ExhibitionCategory: {
      type: "object",
      properties: {
        name: {
          type: "string",
          maxLength: 200,
        },
        description: {
          type: "string",
        },
      },
    },
    InvolvedPerson: {
      type: "object",
      properties: {
        person: {
          $ref: "#/$defs/Person",
        },
        role: {
          $ref: "#/$defs/PersonRole",
        },
      },
      required: ["person", "role"],
    },
    InvolvedCorporation: {
      type: "object",
      properties: {
        corporation: {
          $ref: "#/$defs/Corporation",
        },
        role: {
          $ref: "#/$defs/CorporationRole",
        },
      },
      required: ["corporation", "role"],
    },
    Genre: {
      type: "object",
      properties: {
        title: {
          type: "string",
          maxLength: 200,
        },
        description: {
          type: "string",
        },
        image: {
          type: "string",
          format: "uri",
        },
      },
    },
    Exhibition: {
      type: "object",
      properties: {
        title: {
          type: "string",
          maxLength: 200,
        },
        description: {
          type: "string",
        },
        startDate: {
          type: "object",
          properties: {
            dateValue: {
              type: "integer",
              title: "Datumswert",
              maxLength: 8,
            },
            dateModifier: {
              type: "integer",
              title: "Art der Zeitangabe",
              oneOf: [
                {
                  const: 0,
                  title: "exakt",
                },
                {
                  const: 1,
                  title: "ca.",
                },
                {
                  const: 2,
                  title: "vor",
                },
                {
                  const: 3,
                  title: "nach",
                },
              ],
            },
          },
        },
        endDate: {
          type: "object",
          properties: {
            dateValue: {
              title: "Datumswert",
              type: "integer",
              maxLength: 8,
            },
            dateModifier: {
              type: "integer",
              title: "Art der Zeitangabe",
              oneOf: [
                {
                  const: 0,
                  title: "exakt",
                },
                {
                  const: 1,
                  title: "ca.",
                },
                {
                  const: 2,
                  title: "vor",
                },
                {
                  const: 3,
                  title: "nach",
                },
              ],
            },
          },
        },
        subtitle: {
          type: "string",
          maxLength: 200,
        },
        originalTitle: {
          type: "string",
          maxLength: 200,
        },
        exhibitionSeries: {
          $ref: "#/$defs/ExhibitionSeries",
        },
        exhibitionCategory: {
          $ref: "#/$defs/ExhibitionCategory",
        },
        exhibitionGenre: {
          type: "array",
          items: {
            $ref: "#/$defs/Genre",
          },
        },
        parent: {
          title: "Übergeordnete Ausstellung",
          $ref: "#/$defs/Exhibition",
        },
        externalId: {
          type: "string",
          maxLength: 50,
        },
        exhibitionType: {
          $ref: "#/$defs/EventType",
        },
        published: {
          type: "boolean",
        },
        editorNote: {
          type: "string",
          maxLength: 300,
        },
        placesUnknown: {
          type: "boolean",
        },
        places: {
          type: "array",
          items: {
            $ref: "#/$defs/Place",
          },
        },
        locations: {
          type: "array",
          items: {
            $ref: "#/$defs/Location",
          },
        },
        tags: {
          type: "array",
          items: {
            $ref: "#/$defs/Tag",
          },
        },
        exposedArtists: {
          type: "array",
          items: {
            $ref: "#/$defs/Person",
          },
        },
        curators: {
          type: "array",
          items: {
            $ref: "#/$defs/Person",
          },
        },
        involvedPersons: {
          type: "array",
          items: {
            $ref: "#/$defs/InvolvedPerson",
          },
        },
        organizers: {
          type: "array",
          items: {
            $ref: "#/$defs/Corporation",
          },
        },
        involvedCorporations: {
          type: "array",
          items: {
            $ref: "#/$defs/InvolvedCorporation",
          },
        },
        exhibitionweblink: {
          type: "string",
          format: "uri",
        },
        finissage: {
          type: "object",
          properties: {
            dateValue: {
              type: "integer",
              title: "Datumswert",
              maxLength: 8,
            },
          },
        },
        midissage: {
          type: "object",
          properties: {
            dateValue: {
              type: "integer",
              title: "Datumswert",
              maxLength: 8,
            },
          },
        },
        vernissage: {
          type: "object",
          properties: {
            dateValue: {
              type: "integer",
              title: "Datumswert",
              maxLength: 8,
            },
          },
        },
        exponats: {
          type: "array",
          items: {
            $ref: "#/$defs/ExhibitionExponat",
          },
        },
        catalogs: {
          type: "array",
          items: {
            $ref: "#/$defs/Resource",
          },
        },
        resources: {
          type: "array",
          items: {
            $ref: "#/$defs/Resource",
          },
        },
        image: {
          type: "string",
          format: "uri",
        },
      },
    },
  },
};

export const schema = extendDefinitionsWithProperties(
  rawSchema,
  () => schemaExpander.additionalProperties,
  undefined,
  schemaExpander.options,
);
