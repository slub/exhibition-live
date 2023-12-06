import { sladb } from "../form/formConfigs";
import {
  DeclarativeMapping,
  DeclarativeMappings,
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
      path: "id",
    },
    target: {
      path: "idAuthority.@id",
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
      path: "endDate.dateValue",
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
      path: "startDate.dateValue",
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
      path: "startDate.dateValue",
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
      path: "endDate.dateValue",
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
      path: "organizerOrHost",
    },
    target: {
      path: "involvedCorporations",
    },
    mapping: {
      strategy: {
        id: "createEntity",
        options: {
          typeIRI: sladb("InvolvedCorporation").value,
          subFieldMapping: {
            fromEntity: [
              {
                source: {
                  path: "",
                },
                target: {
                  path: "role.@id",
                },
                mapping: {
                  strategy: {
                    id: "constant",
                    options: {
                      value:
                        "http://ontologies.slub-dresden.de/exhibition/organizer",
                    },
                  },
                },
              },
              {
                source: {
                  path: "",
                },
                target: {
                  path: "corporation",
                },
                mapping: {
                  strategy: {
                    id: "createEntity",
                    options: {
                      typeIRI: sladb("Corporation").value,
                      typeName: "Corporation",
                      subFieldMapping: {
                        fromEntity: [
                          {
                            source: {
                              path: "label",
                            },
                            target: {
                              path: "name",
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
            ],
          },
        },
      },
    },
  },
  {
    source: {
      path: "hierarchicalSuperiorOfTheConferenceOrEvent.0",
    },
    target: {
      path: "parent",
    },
    mapping: {
      strategy: {
        id: "createEntity",
        options: {
          typeIRI: sladb("Exhibition").value,
          typeName: "Exhibition",
          subFieldMapping: {},
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

export const locationDeclarativeMapping: DeclarativeMappings = [
  {
    source: {
      path: "preferredName",
    },
    target: {
      path: "title",
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
      path: "depiction",
    },
    target: {
      path: "image",
    },
  },
];

export const occupationDeclarativeMapping: DeclarativeMappings = [
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
        oneOf: [
          {
            type: "string",
          },
          {
            type: "array",
            items: {
              type: "string",
            },
          },
        ],
      },
    },
    target: {
      path: "birthDate",
    },
    mapping: {
      strategy: {
        id: "dateStringToSpecialInt",
      },
    },
  },
  {
    source: {
      expectedSchema: {
        oneOf: [
          {
            type: "string",
          },
          {
            type: "array",
            items: {
              type: "string",
            },
          },
        ],
      },
      path: "dateOfDeath",
    },
    target: {
      path: "deathDate",
    },
    mapping: {
      strategy: {
        id: "dateStringToSpecialInt",
      },
    },
  },
  {
    source: {
      path: "dateOfDeath",
    },
    target: {
      path: "personDeceased",
    },
    mapping: {
      strategy: {
        id: "exists",
      },
    },
  },
  {
    source: {
      path: "professionOrOccupation",
    },
    target: {
      path: "occupation",
    },
    mapping: {
      strategy: {
        id: "createEntity",
        options: {
          typeIRI: sladb("Occupation").value,
          subFieldMapping: {
            fromEntity: occupationDeclarativeMapping,
          },
        },
      },
    },
  },
  {
    source: {
      path: "professionOrOccupation",
    },
    target: {
      path: "professionWithGND",
    },
  },
  {
    source: {
      path: "$.professionOrOccupation[*].label",
    },
    target: {
      path: "profession",
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
  {
    source: {
      path: "variantName",
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
      path: "id",
    },
    target: {
      path: "idAuthority.@id",
    },
  },
  {
    source: {
      path: "spatialAreaOfActivity",
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

export const declarativeMappings: DeclarativeMapping = {
  Exhibition: exhibitionDeclarativeMapping,
  Person: personDeclarativeMapping,
  Corporation: corporateBodyDeclarativeMapping,
  ExhibitionExponat: workDeclarativeMapping,
  Location: locationDeclarativeMapping,
};
