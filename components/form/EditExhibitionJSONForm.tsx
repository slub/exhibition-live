import 'react-json-view-lite/dist/index.css'

import {JsonFormsCore, rankWith, schemaMatches, scopeEndsWith} from '@jsonforms/core'
import {materialCells, materialRenderers} from '@jsonforms/material-renderers'
import {JsonForms} from '@jsonforms/react'
import * as jsonld from 'jsonld'
import isEmpty from 'lodash/isEmpty'
import React, {FunctionComponent, useCallback, useState} from 'react'
import {JsonView} from 'react-json-view-lite'

import schema from '../../schema/exhibition-info.schema.json'
import AutocompleteURIFieldRenderer from '../renderer/AutocompleteURIFieldRenderer'
import AutoIdentifierRenderer from '../renderer/AutoIdentifierRenderer'
import MaterialCustomAnyOfRenderer, {materialCustomAnyOfControlTester} from '../renderer/MaterialCustomAnyOfRenderer'

export const exhibitionSchema = {...schema, ...schema.$defs.Exhibition}

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
    renderer: AutocompleteURIFieldRenderer,
  }, {
    tester: rankWith(10,
        scopeEndsWith('@id')
    ),
    renderer: AutoIdentifierRenderer
  }
]

const sladb = 'http://ontology.slub-dresden.de/exhibition#'
const slent = 'http://ontology.slub-dresden.de/exhibition/entities#'
const EditExhibitionJSONForm: FunctionComponent<Props> = ({data, setData}) => {
  const [jsonldData, setJsonldData] = useState<any>({})
  const handleFormChange = useCallback(
      (state: Pick<JsonFormsCore, 'data' | 'errors'>) => {
        setData(state.data)
        const jsonldDoc = {
          '@context': {
            '@vocab': sladb,
            'xsd': 'http://www.w3.org/2001/XMLSchema#',
            'birth_date': {
              '@type': 'xsd:date'
            },
            'death_date': {
              '@type': 'xsd:date'
            }
          },
          ...JSON.parse(JSON.stringify(state.data))
        }
        jsonld.JsonLdProcessor.expand( jsonldDoc ).then(res => setJsonldData(res))
        //jsonld.toRDF(jsonldDoc).then(res => console.log(res))

      }, [ setData, setJsonldData])


  return (<>
        <JsonForms
            data={data}
            renderers={renderers}
            cells={materialCells}
            onChange={handleFormChange}
            schema={exhibitionSchema}
        />
        <JsonView data={jsonldData} shouldInitiallyExpand={(lvl) => lvl < 5}/>
      </>
  )
}

export default EditExhibitionJSONForm

