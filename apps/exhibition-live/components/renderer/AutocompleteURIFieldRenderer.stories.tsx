import {formatIs, isStringControl, JsonFormsCore, rankWith,schemaMatches} from '@jsonforms/core'
import {materialCells, materialRenderers} from '@jsonforms/material-renderers'
import {JsonForms} from '@jsonforms/react'
import {ComponentMeta} from '@storybook/react'
import isEmpty from 'lodash/isEmpty'
import {useCallback, useState} from 'react'

import AutocompleteURIFieldRenderer from './AutocompleteURIFieldRenderer'

export default {
  title: 'form/exhibition/AutocompleteURIFieldRenderer',
component: AutocompleteURIFieldRenderer,
} as ComponentMeta<typeof AutocompleteURIFieldRenderer>

const schema = {
  '$schema': 'http://json-schema.org/draft-07/schema#',
  '$id': 'https://example.com/person.schema.json',
  'title': 'Person',
  'description': 'A human being',
  'type': 'object',
  'properties': {
    'wikidata': {
      'format': 'wikidata-Q5',
      'type': 'string'
    },
    'city': {
      'format': 'wikidata-Q515',
      'type': 'string'
    },
    'museum': {
      'format': 'wikidata-Q33506',
      'type': 'string'
    }
  }
}

const renderers = [
  ...materialRenderers,
  {
    tester: rankWith(10,
        schemaMatches(
            schema =>
                Boolean(!isEmpty(schema) &&
                schema.format?.startsWith('wikidata'))
        )
    ),
    renderer: AutocompleteURIFieldRenderer
  }
]
export const AutocompleteURIFieldRendererDefault = () => {
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


