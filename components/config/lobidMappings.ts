import {sladb} from '../form/formConfigs'
import {DeclarativeMappings, GNDToOwnModelMap} from '../utils/gnd/mapGNDToModel'

export const exhibitionDeclarativeMapping: DeclarativeMappings = [
  {
    source: {
      path: 'preferredName',
      expectedSchema: {
        type: 'string'
      }
    },
    target: {
      path: 'title'
    }
  },
  {
    source: {
      path: 'variantName',
      expectedSchema: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    },
    target: {
      path: 'titleVariant'
    },
    mapping: {
      strategy: {
        id: 'append',
        options: {
          allowDuplicates: false
        }
      }
    }
  },
  {
    source: {
      path: 'dateOfConferenceOrEvent',
    },
    target: {
      path: 'toDate'
    },
    mapping: {
      strategy: {
        id: 'dateRangeStringToSpecialInt',
        options: {
          extractElement: 'end'
        }
      }
    }
  },
  {
    source: {
      path: 'dateOfConferenceOrEvent',
    },
    target: {
      path: 'fromDate'
    },
    mapping: {
      strategy: {
        id: 'dateRangeStringToSpecialInt',
        options: {
          extractElement: 'start'
        }
      }
    }
  },
  {
    source: {
      path: 'dateOfEstablishment'
    },
    target: {
      path: 'fromDate'
    },
    mapping: {
      strategy: {
        id: 'dateStringToSpecialInt'
      }
    }
  },
  {
    source: {
      path: 'dateOfTermination',
      expectedSchema: {
        type: 'integer'
      }
    },
    target: {
      path: 'toDate',
    },
    mapping: {
      strategy: {
        id: 'dateStringToSpecialInt'
      }
    }
  },
  {
    source: {
      path: 'biographicalOrHistoricalInformation'
    },
    target: {
      path: 'description'
    },
    mapping: {
      strategy: {
        id: 'concatenate',
        options: {
          separator: '\n'
        }
      }
    }
  },
  {
    source: {
      path: 'placeOfConferenceOrEvent'
    },
    target: {
      path: 'locations'
    },
    mapping: {
      strategy: {
        id: 'createEntity',
        options: {
          typeIRI: sladb('Place').value,
          subFieldMapping: {
            fromEntity: [
              {
                source: {
                  path: 'label'
                },
                target: {
                  path: 'title'
                }
              },
              {
                source: {
                  path: 'id'
                },
                target: {
                  path: 'idAuthority'
                }
              }
            ]
          }
        }
      }
    }
  },
  {
    source: {
      path: 'topic'
    },
    target: {
      path: 'tag'
    },
    mapping: {
      strategy: {
        id: 'createEntity',
        options: {
          subFieldMapping: {
            fromEntity: [
              {
                source: {
                  path: 'label'
                },
                target: {
                  path: 'title'
                }
              },
              {
                source: {
                  path: 'id'
                },
                target: {
                  path: 'idAuthority'
                }
              }
            ]
          }
        }
      }
    }
  }
]
export const gndFieldsToOwnModelMap: GNDToOwnModelMap = {
  'Person': {
    'name': {
      'path': 'preferredName',
      'type': 'string'
    },
    'birthDate': {
      'path': 'dateOfBirth.0',
      'type': 'string'
    },
    'deathDate': {
      'path': 'dateOfDeath.0',
      'type': 'string'
    },
    'image': {
      //depiction?.[0]?.thumbnail
      'path': 'depiction.0.thumbnail',
    }
  },
  'CorporateBody': {
    'preferredName': {
      'path': 'preferredName',
    }
  },
  'Work': {
    'name': {
      'path': 'preferredName',
      'type': 'string'
    },
    'year': {
      'path': 'dateOfProduction.0',
    }
  }
}