import {GNDToOwnModelMap} from '../utils/gnd/mapGNDToModel'

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