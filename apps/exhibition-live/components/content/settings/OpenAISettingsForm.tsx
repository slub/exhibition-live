import {JsonFormsCore, JsonSchema} from '@jsonforms/core'
import {materialCells, materialRenderers} from '@jsonforms/material-renderers'
import {JsonForms} from '@jsonforms/react'
import {Typography} from '@mui/material'
import {Box} from '@mui/system'
import React, {FunctionComponent, useCallback} from 'react'

import {useSettings} from '../../state/useLocalSettings'

interface OwnProps {
}

type Props = OwnProps;

const schema: JsonSchema = {
  '$schema': 'http://json-schema.org/draft-07/schema#',
  'type': 'object',
    'properties': {
      'organization': {
        'type': 'string'
      },
      'apiKey': {
        'type': 'string'
      }
    }
}

const OpenAISettingsForm: FunctionComponent<Props> = (props) => {
  const {openai, setOpenAIConfig} = useSettings()

  const handleFormChange = useCallback(
      (state: Pick<JsonFormsCore, 'data' | 'errors'>) => {
        setOpenAIConfig(state.data)
      }, [setOpenAIConfig])
  return (<Box>
        <Typography variant='h6'>OpenAI Einstellungen</Typography>
        <JsonForms
            data={openai}
            schema={schema}
            renderers={materialRenderers}
            cells={materialCells}
            onChange={handleFormChange}/>
      </Box>
  )
}


export default OpenAISettingsForm
