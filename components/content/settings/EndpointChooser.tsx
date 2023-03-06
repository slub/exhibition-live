import {JsonFormsCore, JsonSchema} from '@jsonforms/core'
import {materialCells, materialRenderers} from '@jsonforms/material-renderers'
import {JsonForms} from '@jsonforms/react'
import {Box} from '@mui/system'
import {JSONSchema7} from 'json-schema'
import React, {FunctionComponent, useCallback} from 'react'

import {useSettings} from '../../state/useLocalSettings'

interface OwnProps {
}

type Props = OwnProps;

const schema: JsonSchema = {
  '$schema': 'http://json-schema.org/draft-07/schema#',
  'type': 'array',
  'items': {
    'type': 'object',
    'properties': {
      'endpoint': {
        'type': 'string'
      },
      'label': {
        'type': 'string'
      },
      'active': {
        'type': 'boolean'
      }
    }
  }
}

const EndpointChooser: FunctionComponent<Props> = (props) => {
  const {sparqlEndpoints, setSparqlEndpoints} = useSettings()

  const handleFormChange = useCallback(
      (state: Pick<JsonFormsCore, 'data' | 'errors'>) => {
        setSparqlEndpoints(state.data)
      }, [setSparqlEndpoints])
  // a REACT MUI paper list with checkboxes
  return (<Box>
        <JsonForms
            data={sparqlEndpoints}
            schema={schema}
            renderers={materialRenderers}
            cells={materialCells}
            onChange={handleFormChange}/>
      </Box>
  )
}


export default EndpointChooser
