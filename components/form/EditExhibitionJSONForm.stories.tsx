import { button} from '@storybook/addon-knobs'
import {ComponentMeta} from '@storybook/react'
import {JSONSchema7} from 'json-schema'
import { JSONSchemaFaker } from 'json-schema-faker'
import {useState} from 'react'

import schema from '../../schema/exhibition-info.schema.json'
import {useLocalSettings, useSettings} from '../state/useLocalSettings'
import {oxigraphCrudOptions} from '../utils/sparql/remoteOxigraph'
import {defaultJsonldContext, defaultPrefix, defaultQueryBuilderOptions} from './formConfigs'
import SemanticJsonForm from './SemanticJsonForm'

const exhibitionSchema = {...schema, ...schema.$defs.Exhibition}

export default {
  title: 'form/exhibition/EditExhibitionJSONForm',
  component: SemanticJsonForm
} as ComponentMeta<typeof SemanticJsonForm>

export const SemanticJsonFormExhibition = () => {
  const [data, setData] = useState<any>()
  const { activeEndpoint } = useSettings()
  const crudOptions = activeEndpoint && oxigraphCrudOptions(activeEndpoint.endpoint)
  button('generate random entry', () => {
    // @ts-ignore
    setData(JSONSchemaFaker.generate(exhibitionSchema))
  })

  return <SemanticJsonForm
      data={data}
      setData={setData}
      typeIRI='http://ontologies.slub-dresden.de/exhibition#Exhibition'
      crudOptions={crudOptions}
      defaultPrefix={defaultPrefix}
      jsonldContext={defaultJsonldContext}
      queryBuildOptions={defaultQueryBuilderOptions}
      schema={exhibitionSchema as JSONSchema7}
  />
}
