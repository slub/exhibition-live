import {JsonFormsCore, rankWith, schemaMatches} from '@jsonforms/core'
import {materialCells, materialRenderers} from '@jsonforms/material-renderers'
import {JsonForms} from '@jsonforms/react'
import isEmpty from 'lodash/isEmpty'
import React, {FunctionComponent, useCallback} from 'react'

import uischema from '../../schema/exhibition-form-ui-schema.json'
import schema from '../../schema/exhibition-info.schema.json'
import AutocompleteURIFieldRenderer from '../renderer/AutocompleteURIFieldRenderer'
import MaterialCustomAnyOfRenderer, {materialCustomAnyOfControlTester} from '../renderer/MaterialCustomAnyOfRenderer'

const exhibitionSchema = { ...schema, ...schema.$defs.Exhibition}

interface OwnProps {
  data: any,
  setData: (data: any) => void
}

type Props = OwnProps;

const renderers = [
  ...materialRenderers,
  {
    tester: materialCustomAnyOfControlTester,
    renderer: MaterialCustomAnyOfRenderer
  }, {
    tester: rankWith(10,
    schemaMatches(
        schema =>
            Boolean(!isEmpty(schema) &&
                schema.format?.startsWith('wikidata'))
    )),
    renderer: AutocompleteURIFieldRenderer}]
const EditExhibitionJSONForm: FunctionComponent<Props> = ({data, setData}) => {
  const handleFormChange = useCallback(
      (state: Pick<JsonFormsCore, 'data' | 'errors'>) => {
        setData(state.data)
      }, [setData])

  return (
      <JsonForms
          data={data}
          renderers={renderers}
          cells={materialCells}
          onChange={handleFormChange}
          schema={exhibitionSchema}
          uischema={uischema}
      />
  )
}

export default EditExhibitionJSONForm
