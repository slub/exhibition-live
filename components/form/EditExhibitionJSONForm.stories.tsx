import { button} from '@storybook/addon-knobs'
import {ComponentMeta} from '@storybook/react'
import { JSONSchemaFaker } from 'json-schema-faker'
import {useState} from 'react'

import EditExhibitionJSONForm, {exhibitionSchema} from './EditExhibitionJSONForm'

export default {
  title: 'form/exhibition/EditExhibitionJSONForm',
  component: EditExhibitionJSONForm
} as ComponentMeta<typeof EditExhibitionJSONForm>

export const EditExhibitionJSOnFormDefault = () => {
  const [data, setData] = useState<any>()
  button('generate random entry', () => {
    // @ts-ignore
    setData(JSONSchemaFaker.generate(exhibitionSchema))
  })

  return <EditExhibitionJSONForm data={data} setData={setData}/>
}
