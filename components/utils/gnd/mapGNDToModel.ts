import {JsonSchema} from '@jsonforms/core'
import Ajv from 'ajv'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import set from 'lodash/set'

import {getPaddedDate} from '../core/specialDate'

dayjs.extend(customParseFormat)

export type GNDToOwnModelMap = {
  [gndType: string]: {
    [slubField: string]: {
      path: string
      type?: 'string' | 'number' | 'boolean' | 'array' | 'object',
      mapping?: {
        strategy: 'concatenate' | 'first' | 'last'
      }
    }
  }
}

interface Strategy {
  id: string
}

export type StrategyContext = {
  getPrimaryIRIBySecondaryIRI: (secondaryIRI: string, authorityIRI: string, typeIRI: string) => Promise<string | null>
  authorityIRI: string,
  newIRI: (typeIRI: string) => string
}

export type StrategyFunction = (sourceData: any, targetData: any, options?: any, context?: StrategyContext) => Promise<any> | any

type ConcatenateStrategy = Strategy & {
  id: 'concatenate'
  options?: {
    separator?: string
  }
}

const concatenate = (sourceData: any[], _targetData: string, options?: ConcatenateStrategy['options']): string => {
  const separator = options?.separator || ''
  return sourceData.join(separator)
}

type TakeFirstStrategy = Strategy & {
  id: 'takeFirst'
}
const takeFirst = (sourceData: any[], _targetData: any): any => sourceData[0]

type AppendStrategy = Strategy & {
  id: 'append',
  options?: {
    allowDuplicates?: boolean
  }
}

const append = (values: any[], targetData: any[], options?: AppendStrategy['options']): any[] => {
  const {allowDuplicates} = options || {}
  const all = [...(targetData || []), ...values]
  if (allowDuplicates)
    return all
  // @ts-ignore
  return [...(new Set(all)).values()]
}

type CreateEntityStrategy = Strategy & {
  id: 'createEntity',
  options?: {
    typeIRI?: string,
    subFieldMapping: {
      fromSelf?: DeclarativeMappings,
      fromEntity?: DeclarativeMappings
    }
  }
}

const createEntity = async (sourceData: any, _targetData: any, options?: CreateEntityStrategy['options'], context?: StrategyContext): Promise<any> => {
  if (!context) throw new Error('No context provided')
  const {typeIRI, subFieldMapping} = options || {}
  const isArray = Array.isArray(sourceData)
  const sourceDataArray = isArray ? sourceData : [sourceData]
  const {getPrimaryIRIBySecondaryIRI, newIRI, authorityIRI} = context
  const newDataElements = []
  for(const sourceDataElement of sourceDataArray) {
    const primaryIRI = await getPrimaryIRIBySecondaryIRI(sourceDataElement.id, authorityIRI, typeIRI || '')
    if (!primaryIRI) {
      const targetData = {
        '@id': newIRI(typeIRI || ''),
        '@type': typeIRI
      }
      const entityIRI = primaryIRI || newIRI(typeIRI)
      newDataElements.push(await mapGNDToModel2(sourceDataElement, targetData, subFieldMapping.fromEntity || [], context ))
    } else {
      newDataElements.push({
        '@id': primaryIRI
      })
    }
  }
  return isArray ? newDataElements : newDataElements[0]
}

type DateStringToSpecialInt = Strategy & {
  id: 'dateStringToSpecialInt'
}

const dayJsDateToSpecialInt = (date: dayjs.Dayjs): number | null => {
  if(date.isValid()) {
    const paddedDateString =  getPaddedDate(date.toDate())
    return Number(paddedDateString)
  }
  return null
}
const dateStringToSpecialInt = (sourceData: string | string[], _targetData: any): number | null => {
  const data = Array.isArray(sourceData) ? sourceData[0] : sourceData
  if(!data) return null
  return dayJsDateToSpecialInt(dayjs(data, 'DD.MM.YYYY'))
}

type DateRangeStringToSpecialInt = Strategy & {
  id: 'dateRangeStringToSpecialInt'
  options?: {
    extractElement: 'start' | 'end'
  }
}

const dateRangeStringToSpecialInt = (sourceData: string | string[], _targetData: any, options?: DateRangeStringToSpecialInt['options']): number | null => {
  const {extractElement} = options || {}
  const data = Array.isArray(sourceData) ? sourceData[0] : sourceData
  if(!data) return null
  const [start, end] = data.split('-')
  return dayJsDateToSpecialInt(dayjs(extractElement === 'start' ? start : end, 'DD.MM.YYYY'))
}


type AnyStrategy =
    ConcatenateStrategy
    | TakeFirstStrategy
    | AppendStrategy
    | CreateEntityStrategy
    | DateRangeStringToSpecialInt
    | DateStringToSpecialInt

const strategyFunctionMap: { [k: string]: StrategyFunction } = {
  concatenate,
  takeFirst,
  append,
  createEntity,
  dateStringToSpecialInt,
  dateRangeStringToSpecialInt
}


export type DeclarativeSimpleMapping = {
  source: {
    path: string
    expectedSchema?: JsonSchema
  },
  target: {
    path: string
  },
  mapping?: {
    strategy: AnyStrategy
  }
}

export type DeclarativeMappings = DeclarativeSimpleMapping[]

export const mapGNDToModel2 = async (gndEntryData: Record<string, any>, targetData: any, mappingConfig: DeclarativeMappings, strategyContext: StrategyContext): Promise<any> => {
  const newData = cloneDeep(targetData)
  const ajv = new Ajv()
  await Promise.all(mappingConfig.map(async ({source, target, mapping}) => {
    const {path: sourcePath, expectedSchema} = source
    const {path: targetPath} = target
    const sourceValue = get(gndEntryData, sourcePath)
    if (sourceValue) {
      if (!expectedSchema || ajv.validate(expectedSchema, sourceValue)) {
        if(!mapping?.strategy) {
          //take value as is
          set(newData, targetPath, sourceValue)
        } else {
          const strategyFunction = strategyFunctionMap[mapping.strategy.id]
          if(typeof strategyFunction !== 'function') {
            throw new Error(`Strategy ${mapping.strategy.id} is not implemented`)
          }
          const strategyOptions = (mapping.strategy as any).options
          try {
            const value = await strategyFunction(sourceValue, get(newData, targetPath), strategyOptions, strategyContext)
            set(newData, targetPath, value)
          } catch (e) {
            console.error('Error while executing mapping strategy', e)
          }
        }
      } else {
        console.warn(`Value does not match expected schema ${JSON.stringify(expectedSchema)}`)
      }
    }
  }))
  return newData
}
export const mapGNDToModel = (gndType: string, gndEntryData: Record<string, any>, mappingModel: GNDToOwnModelMap): any => {
  const fields = mappingModel[gndType]
  if (!fields) {
    return {}
  }
  const ownModel: Record<string, any> = {}
  Object.entries(fields).map(([slubField, fieldMapping]) => {
    const {path, type} = fieldMapping
    const value = get(gndEntryData, path)
    if (value) {
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
