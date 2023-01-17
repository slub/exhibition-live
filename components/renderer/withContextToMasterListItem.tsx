import {
  composePaths, getData,
  JsonFormsState,
  Resolve,
} from '@jsonforms/core'
import {JsonFormsStateContext} from '@jsonforms/react'
import find from 'lodash/find'
import React, {ComponentType} from 'react'

import {filterUndefOrNull, resolveObj} from '../utils/core'
import {OwnPropsOfMasterListItem, StatePropsOfMasterItem} from './ListWithDetailMasterItem'

export const mapStateToMasterListItemProps = (
  state: JsonFormsState,
  ownProps: OwnPropsOfMasterListItem
): StatePropsOfMasterItem => {
  const {schema, path, index, uischema} = ownProps
  /*const foundUISchema = findUISchema(
    state.jsonforms.uischemas,
    schema,
    uischema.scope,
    path
  )
  console.log({foundUISchema})*/
  const findFirstPrimitiveProp = () => schema.properties
    ? find(Object.keys(schema.properties), propName => {
      // @ts-ignore
      const prop = schema.properties[propName]
      return (
        prop.type === 'string' ||
        prop.type === 'number' ||
        prop.type === 'integer'
      )
    })
    : undefined
  const labelProp: any = uischema.options?.elementLabelProp || findFirstPrimitiveProp()
  const labelJoint = uischema.options?.elementLabelJoint || ' '
  const childPath = composePaths(path, `${index}`)
  const childData = Resolve.data(getData(state), childPath)
  let childLabel
  if (Array.isArray(labelProp)) {
    childLabel = filterUndefOrNull(
      labelProp.map(prop => typeof prop === 'string' && resolveObj( childData, prop, undefined )))
      .join(labelJoint)
  } else {
    childLabel = labelProp ? childData[labelProp] : ''
  }

  return {
    ...ownProps,
    childLabel: childLabel
  }
}

export const ctxToMasterListItemProps = (
  ctx: JsonFormsStateContext,
  ownProps: OwnPropsOfMasterListItem
) => mapStateToMasterListItemProps({jsonforms: {...ctx}}, ownProps)

export const withContextToMasterListItemProps =
  // @ts-ignore
  (Component: ComponentType<StatePropsOfMasterItem>): ComponentType<OwnPropsOfMasterListItem> => ({ctx, props}: JsonFormsStateContext & StatePropsOfMasterItem) => {
      const stateProps = ctxToMasterListItemProps(ctx, props)
      return (<Component {...stateProps} {...props} />)
    }

