import {JsonFormsCore, rankWith, scopeEndsWith} from '@jsonforms/core'
import {materialCells, materialRenderers} from '@jsonforms/material-renderers'
import {JsonForms} from '@jsonforms/react'
import {ComponentMeta} from '@storybook/react'
import {useCallback, useState} from 'react'

import AutoIdentifierRenderer from './AutoIdentifierRenderer'

export default {
  title: 'form/exhibition/AutoIdentifierRenderer',
component: AutoIdentifierRenderer,
} as ComponentMeta<typeof AutoIdentifierRenderer>

const schema = {
  '$schema': 'http://json-schema.org/draft-07/schema#',
  '$id': 'https://example.com/person.schema.json',
  'title': 'Person',
  'description': 'A human being',
  'type': 'object',
  'properties': {
    '@id': {
      'title': 'http://ontologies.slub-dresden.de/exhibition/entity#',
      'type': 'string'
    }
  }
}

const renderers = [
  ...materialRenderers,
  {
    tester: rankWith(10,
        scopeEndsWith('@id')
    ),
    renderer: AutoIdentifierRenderer
  }
]
export const AutoIdentifierRendererDefault = () => {
  const [data, setData] = useState<any>({})

  const handleFormChange = useCallback(
      ({data}: Pick<JsonFormsCore, 'data' | 'errors'>) => {
        setData(data)
      }, [setData])

  return <JsonForms
      data={data}
      renderers={renderers}
      cells={materialCells}
      onChange={handleFormChange}
      schema={schema}/>
}


