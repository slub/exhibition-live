import {
  CombinatorKeyword,
  createCombinatorRenderInfos,
  isAnyOfControl,
  JsonSchema,
  RankedTester,
  rankWith, resolveSchema,
  StatePropsOfCombinator
} from '@jsonforms/core'
import { JsonFormsDispatch, withJsonFormsAnyOfProps } from '@jsonforms/react'
import { Hidden, Tab, Tabs } from '@mui/material'
import React, {useCallback, useMemo, useState} from 'react'

import CombinatorProperties from './CombinatorProperties'

export const resolveSubSchemas = (
    schema: JsonSchema,
    rootSchema: JsonSchema,
    keyword: CombinatorKeyword
) => {
  // resolve any $refs, otherwise the generated UI schema can't match the schema???
  if(! Array.isArray(schema[keyword])) return schema
  const schemas = schema[keyword] as any[]
  if (schemas.findIndex(e => e.$ref !== undefined) !== -1) {
    return {
      ...schema,
      [keyword]: (schema[keyword] as any[]).map(e =>
          // @ts-ignore
          e.$ref ? resolveSchema(schema, e.$ref, rootSchema) : e
      )
    }
  }
  return schema
}

const anyOf = 'anyOf'
export const MaterialCustomAnyOfRenderer = ({
  schema,
  rootSchema,
  indexOfFittingSchema,
  visible,
  path,
  renderers,
  cells,
  uischema,
  uischemas
}: StatePropsOfCombinator) => {
  const [selectedAnyOf, setSelectedAnyOf] = useState(indexOfFittingSchema || 0)
  const handleChange = useCallback(
    (_ev: any, value: number) => setSelectedAnyOf(value),
    [setSelectedAnyOf]
  )
  const _schema = useMemo(() => resolveSubSchemas(schema, rootSchema, anyOf), [schema, rootSchema])
  const anyOfRenderInfos = useMemo(() => {
    return createCombinatorRenderInfos(
        // @ts-ignore
        (_schema as JsonSchema).anyOf,
        rootSchema,
        anyOf,
        uischema,
        path,
        uischemas
    )
  }, [_schema, rootSchema, uischema, path, uischemas])

  return (
    <Hidden xsUp={!visible}>
      <CombinatorProperties
        schema={_schema}
        combinatorKeyword={'anyOf'}
        path={path}
      />
      <Tabs value={selectedAnyOf} onChange={handleChange}>
        {anyOfRenderInfos.map(anyOfRenderInfo => {
          console.log({anyOfRenderInfo})
          return (
              <Tab key={anyOfRenderInfo.label} label={anyOfRenderInfo.label}/>
          )
        })}
      </Tabs>
      {anyOfRenderInfos.map(
        (anyOfRenderInfo, anyOfIndex) =>
          selectedAnyOf === anyOfIndex && (
            <JsonFormsDispatch
              key={anyOfIndex}
              schema={anyOfRenderInfo.schema}
              uischema={anyOfRenderInfo.uischema}
              path={path}
              renderers={renderers}
              cells={cells}
            />
          )
      )}
    </Hidden>
  )
}

export const materialCustomAnyOfControlTester: RankedTester = rankWith(
  5,
  isAnyOfControl
)

export default withJsonFormsAnyOfProps(MaterialCustomAnyOfRenderer)
