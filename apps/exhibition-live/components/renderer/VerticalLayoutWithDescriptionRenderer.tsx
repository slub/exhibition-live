import {LayoutProps, VerticalLayout} from '@jsonforms/core'
import {withJsonFormsLayoutProps} from '@jsonforms/react'
import React from 'react'

import {LayoutWithDescriptionRenderer, MaterialLayoutRendererProps} from './LayoutWithDescriptionRenderer'


export const VerticalLayoutWithDescriptionRenderer = ({ uischema, schema, path, enabled, visible, renderers, cells }: LayoutProps) => {
  const verticalLayout = uischema as VerticalLayout
  const childProps: MaterialLayoutRendererProps = {
    elements: verticalLayout.elements,
    schema,
    path,
    enabled,
    direction: 'column',
    visible
  }

  return <LayoutWithDescriptionRenderer {...childProps} renderers={renderers} cells={cells} />
}

export default withJsonFormsLayoutProps(VerticalLayoutWithDescriptionRenderer)
