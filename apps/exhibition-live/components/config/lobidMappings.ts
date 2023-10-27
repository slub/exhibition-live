import { sladb } from "../form/formConfigs";
import {
  DeclarativeMappings,
  GNDToOwnModelMap,
} from "../utils/mapping/mappingStrategies";

export const exhibitionDeclarativeMapping: DeclarativeMappings = [
  {
    source: {
      path: "preferredName",
      expectedSchema: {
        type: "string",
      },
    },
    target: {
      path: "title",
    },
  },
  {
    source: {
      path: "variantName",
      expectedSchema: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
    target: {
      path: "titleVariant",
    },
    mapping: {
      strategy: {
        id: "append",
        options: {
          allowDuplicates: false,
        },
      },
    },
  },
  {
    source: {
      path: "dateOfConferenceOrEvent",
    },
    target: {
      path: "toDate",
    },
    mapping: {
      strategy: {
        id: "dateRangeStringToSpecialInt",
        options: {
          extractElement: "end",
        },
      },
    },
  },
  {
    source: {
      path: "dateOfConferenceOrEvent",
    },
    target: {
      path: "fromDate",
    },
    mapping: {
      strategy: {
        id: "dateRangeStringToSpecialInt",
        options: {
          extractElement: "start",
        },
      },
    },
  },
  {
    source: {
      path: "dateOfEstablishment",
    },
    target: {
      path: "fromDate",
    },
    mapping: {
      strategy: {
        id: "dateStringToSpecialInt",
      },
    },
  },
  {
    source: {
      path: "dateOfTermination",
      expectedSchema: {
        type: "integer",
      },
    },
    target: {
      path: "toDate",
    },
    mapping: {
      strategy: {
        id: "dateStringToSpecialInt",
      },
    },
  },
  {
    source: {
      path: "biographicalOrHistoricalInformation",
    },
    target: {
      path: "description",
    },
    mapping: {
      strategy: {
        id: "concatenate",
        options: {
          separator: "\n",
        },
      },
    },
  },
  {
    source: {
      path: "placeOfConferenceOrEvent",
    },
    target: {
      path: "locations",
    },
    mapping: {
      strategy: {
        id: "createEntity",
        options: {
          typeIRI: sladb("Location").value,
          subFieldMapping: {
            fromEntity: [
              {
                source: {
                  path: "label",
                },
                target: {
                  path: "title",
                },
              },
              {
                source: {
                  path: "id",
                },
                target: {
                  path: "idAuthority.@id",
                },
              },
            ],
          },
        },
      },
    },
  },
  {
    source: {
      path: "topic",
    },
    target: {
      path: "tag",
    },
    mapping: {
      strategy: {
        id: "createEntity",
        options: {
          subFieldMapping: {
            fromEntity: [
              {
                source: {
                  path: "label",
                },
                target: {
                  path: "title",
                },
              },
              {
                source: {
                  path: "id",
                },
                target: {
                  path: "idAuthority.@id",
                },
              },
            ],
          },
        },
      },
    },
  },
];

export const personDeclarativeMapping: DeclarativeMappings = [
  {
    source: {
      path: "preferredName",
      expectedSchema: {
        type: "string",
      },
    },
    target: {
      path: "name",
    },
  },
  {
    source: {
      path: "variantName",
      expectedSchema: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
    target: {
      path: "nameVariant",
    },
    mapping: {
      strategy: {
        id: "append",
      },
    },
  },
  {
    source: {
      path: "dateOfBirth",
      expectedSchema: {
        type: "string",
      },
    },
    target: {
      path: "birthDate",
    },
    mapping: {
      strategy: {
        id: "takeFirst",
      },
    },
  },
  {
    source: {
      path: "dateOfDeath",
      expectedSchema: {
        type: "string",
      },
    },
    target: {
      path: "deathDate",
    },
    mapping: {
      strategy: {
        id: "takeFirst",
      },
    },
  },
  {
    source: {
      path: "depiction.0.thumbnail",
    },
    target: {
      path: "image",
    },
  },
];

export const corporateBodyDeclarativeMapping: DeclarativeMappings = [
  {
    source: {
      path: "preferredName",
      expectedSchema: {
        type: "string",
      },
    },
    target: {
      path: "name",
    },
  },
];

export const workDeclarativeMapping: DeclarativeMappings = [
  {
    source: {
      path: "preferredName",
      expectedSchema: {
        type: "string",
      },
    },
    target: {
      path: "title",
    },
  },
  {
    source: {
      path: "dateOfProduction.0",
    },
    target: {
      path: "fromDate",
    },
  },
];

export const declarativeMappings: { [key: string]: DeclarativeMappings } = {
  Exhibition: exhibitionDeclarativeMapping,
  Person: personDeclarativeMapping,
  Corporation: corporateBodyDeclarativeMapping,
  ExhibitionExponat: workDeclarativeMapping,
};
export const gndFieldsToOwnModelMap: GNDToOwnModelMap = {
  Person: {
    name: {
      path: "preferredName",
      type: "string",
    },
    birthDate: {
      path: "dateOfBirth.0",
      type: "string",
    },
    deathDate: {
      path: "dateOfDeath.0",
      type: "string",
    },
    image: {
      //depiction?.[0]?.thumbnail
      path: "depiction.0.thumbnail",
    },
  },
  CorporateBody: {
    preferredName: {
      path: "preferredName",
    },
  },
  Work: {
    name: {
      path: "preferredName",
      type: "string",
    },
    year: {
      path: "dateOfProduction.0",
    },
  },
};
