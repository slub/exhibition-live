import {ComponentMeta} from '@storybook/react'
import {useState} from 'react'

import EditExhibitionJSONForm from './EditExhibitionJSONForm'

export default {
  title: 'form/exhibition/EditExhibitionJSONForm',
  component: EditExhibitionJSONForm
} as ComponentMeta<typeof EditExhibitionJSONForm>

export const EditExhibitionJSOnFormDefault = () => {
  const [data, setData] = useState<any>({})
  return <EditExhibitionJSONForm data={data} setData={setData}/>
}
