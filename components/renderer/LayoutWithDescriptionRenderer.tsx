import type {JsonFormsState, UISchemaElement} from '@jsonforms/core'
import {
  composeWithUi,
  ControlElement,
  getAjv, getData,
  getSchema,
  getTranslator, hasShowRule, isVisible,
  JsonFormsCellRendererRegistryEntry, JsonFormsRendererRegistryEntry,
  JsonSchema,
  OwnPropsOfRenderer, Resolve
} from '@jsonforms/core'
import {JsonFormsDispatch, useJsonForms} from '@jsonforms/react'
import {Box, FormHelperText, Grid} from '@mui/material'
import Ajv from 'ajv'
import isEmpty from 'lodash/isEmpty'
import React, {ComponentType, useMemo} from 'react'
import {PluggableList} from 'react-markdown/lib/react-markdown'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeSanitize from 'rehype-sanitize'

import {getI18nDescription} from './i18nHelper'
import {MDEditorMarkdown} from './MDEditor'

type LayoutElementProps = {
  index: number,
  state: JsonFormsState,
  schema: JsonSchema,
  visible: boolean,
  path: string,
  enabled: boolean,
  element: UISchemaElement,
  renderers?: JsonFormsRendererRegistryEntry[],
  cells?: JsonFormsCellRendererRegistryEntry[],
}
const LayoutElement = ({
                         index,
                         state,
                         schema,
                         path,
                         enabled,
                         element: child,
                         cells,
                         renderers
                       }: LayoutElementProps) => {
  let i18nDescription
  const translator = getTranslator()(state)
  const rootSchema = getSchema(state)
  const rootData = getData(state)
  if (child.type === 'Control') {
    const controlElement = child as ControlElement
    const resolvedSchema = Resolve.schema(
      schema || rootSchema,
      controlElement.scope,
      rootSchema
    )
    const childPath = composeWithUi(controlElement, path)
    i18nDescription = getI18nDescription(null, translator, child, childPath, resolvedSchema)
  }
  const rehypePlugins = useMemo<PluggableList>(() => [[rehypeSanitize], [rehypeExternalLinks, {target: '_blank'}]], [])
  const visible: boolean = hasShowRule(child)
    ? isVisible(child, rootData, path, getAjv(state)) : true
  return (
    <Grid item key={`${path}-${index}`} xs>
      <Grid container direction={'column'}>
        {i18nDescription && i18nDescription.length > 0 && visible && <Grid item xs>
          <FormHelperText>
            <MDEditorMarkdown
              source={i18nDescription}
              rehypePlugins={rehypePlugins}/>
          </FormHelperText>
        </Grid>
        }
        <Grid item xs>
          <JsonFormsDispatch
            uischema={child}
            schema={schema}
            path={path}
            enabled={enabled}
            renderers={renderers}
            cells={cells}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}

export interface MaterialLayoutRendererProps extends OwnPropsOfRenderer {
  elements: UISchemaElement[];
  direction: 'row' | 'column';
}

const MaterialLayoutRendererComponent =
  (props: MaterialLayoutRendererProps) => {
    const {
      visible,
      elements,
      schema,
      path,
      enabled,
      direction,
      renderers,
      cells
    } = props
    const ctx = useJsonForms()
    const state = {jsonforms: ctx}
    if (isEmpty(elements)) {
      return null
    } else {
      return (
        <Box sx={{display: visible ? 'block' : 'none'}}>
          <Grid
            container
            direction={direction}
            spacing={direction === 'row' ? 2 : 0}
          >{
              elements.map((element, index) =>
                <LayoutElement
                  key={(path || '') + index}
                  index={index}
                  state={state}
                  // @ts-ignore
                  schema={schema}
                  // @ts-ignore
                  visible={visible}
                  // @ts-ignore
                  path={path}
                  // @ts-ignore
                  enabled={enabled}
                  element={element}
                  cells={cells}
                  renderers={renderers}/>)}
          </Grid>
        </Box>
      )
    }
  }
export const LayoutWithDescriptionRenderer = React.memo(MaterialLayoutRendererComponent)

export interface AjvProps {
  ajv: Ajv.Ajv;
}

export const withAjvProps = <P extends {}>(Component: ComponentType<AjvProps & P>) =>
  (props: P) => {
    const ctx = useJsonForms()
    const ajv = getAjv({jsonforms: {...ctx}})

    // @ts-ignore
    return (<Component {...props} ajv={ajv}/>)
  }
