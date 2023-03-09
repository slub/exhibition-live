import get from 'lodash/get'

export type GNDToOwnModelMap = {
  [gndType: string]: {
    [slubField: string]: {
      path: string
      type?: 'string' | 'number' | 'boolean' | 'array' | 'object'
    }
  }
}

export const mapGNDToModel = (gndType: string, gndEntryData: Record<string, any>, mappingModel: GNDToOwnModelMap): any => {
  const fields = mappingModel[gndType]
  if(!fields) {
    return {}
  }
  const ownModel: Record<string, any>= {}
  Object.entries(fields).map(([slubField, fieldMapping]) => {
    const { path, type } = fieldMapping
    const value = get(gndEntryData, path)
    if(value) {
      switch (type) {
        case 'number':
          ownModel[slubField] = Number(value)
          break
        case 'boolean':
          ownModel[slubField] = Boolean(value)
          break
        case 'array':
          ownModel[slubField] = Array.isArray(value) ? value : [value]
          break
        case 'object':
        case 'string':
        default:
          ownModel[slubField] = value
          break
      }
    }
  })
  return ownModel
}
