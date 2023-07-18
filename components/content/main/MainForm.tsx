import {prepareStubbedSchema} from '@graviola/crud-jsonforms'
import {Add as NewIcon} from '@mui/icons-material'
import {Button, Container, IconButton, TextField} from '@mui/material'
import {useQuery} from '@tanstack/react-query'
import {JSONSchema7} from 'json-schema'
import React, {useCallback, useState} from 'react'
import {SplitPane} from 'react-collapse-pane'
import {v4 as uuidv4} from 'uuid'

import {BASE_IRI} from '../../config'
import ContentMainPreview from '../../content/ContentMainPreview'
import {
  defaultJsonldContext,
  defaultPrefix,
  defaultQueryBuilderOptions,
  sladb,
  slent
} from '../../form/formConfigs'
import genSlubJSONLDSemanticProperties from '../../form/genSlubJSONLDSemanticProperties'
import SemanticJsonForm from '../../form/SemanticJsonForm'
import {useUISchemaForType} from '../../form/uischemaForType'
import {uischemas} from '../../form/uischemas'
import {useFormEditor, useOxigraph, useRDFDataSources} from '../../state'
import {useGlobalCRUDOptions} from '../../state/useGlobalCRUDOptions'
import {useSettings} from '../../state/useLocalSettings'
import SPARQLLocalOxigraphToolkit from '../../utils/dev/SPARQLLocalOxigraphToolkit'

type Props = {
  children: React.ReactChild
  data: any
  classIRI: string
}
const WithPreviewForm = ({classIRI, data, children}: Props) => {
  const isLandscape = false
  const {previewEnabled, togglePreview, formData} = useFormEditor()
  const {features} = useSettings()


  return features?.enablePreview
      ? <>
        <Button onClick={() => togglePreview()} style={{
          zIndex: 100,
          position: 'absolute',
          left: '50%'
        }}>Vorschau {previewEnabled ? 'ausblenden' : 'einblenden'}</Button>
        {previewEnabled
            ? <SplitPane split={isLandscape ? 'horizontal' : 'vertical'}>
              <div className={'page-wrapper'} style={{overflow: 'auto', height: '100%'}}>
                {children}
              </div>
              <div>
                {<ContentMainPreview classIRI={classIRI} exhibition={data}/>}
              </div>
            </SplitPane>
            : children}
      </>
      : <>{children}</>

}
const typeName = 'Exhibition'
const classIRI = sladb.Exhibition.value

export type MainFormProps = {
  defaultData?: any
}
const MainForm = ({defaultData}: MainFormProps) => {
  const [data, setData] = useState<any>(defaultData)
  const {oxigraph} = useOxigraph()
  const {crudOptions, doLocalQuery} = useGlobalCRUDOptions()
  const {features } = useSettings()

  const handleNew = useCallback(() => {
    const newURI = `${BASE_IRI}${uuidv4()}`
    setData({
      '@id': newURI,
      '@type': classIRI,
    })
  }, [setData])
  const {data: loadedSchema} = useQuery(['schema', typeName], () => fetch(`./schema/${typeName}.schema.json`).then(async res => {
    const jsonData: any = await res.json()
    if (!jsonData) return
    const prepared = prepareStubbedSchema(jsonData, genSlubJSONLDSemanticProperties )
    const defsFieldName = prepared.definitions ? 'definitions' : '$defs'
    const specificModel = prepared[defsFieldName]?.[typeName] as (object | undefined) || {}
    const finalSchema = {
      ...(typeof prepared === 'object' ? prepared : {}),
      ...specificModel
    }
    console.log('finalSchema', finalSchema)
    return finalSchema
  }))
  const uischemaExternal = useUISchemaForType(classIRI)
  return (
      <>
        <Container>
          <TextField label={'ID'} value={data['@id']} onChange={e => setData({...data, '@id': e.target.value})} fullWidth/>
        </Container>
          <WithPreviewForm data={data} classIRI={classIRI}>
            <>
              <Container className="default-wrapper inline_object_card" >

                {oxigraph && features?.enableDebug && <SPARQLLocalOxigraphToolkit sparqlQuery={doLocalQuery}/>}
                <IconButton onClick={handleNew} aria-label={'neuen Eintrag erstellen'}><NewIcon/></IconButton>
                {loadedSchema && <SemanticJsonForm
                    data={data}
                    entityIRI={data['@id']}
                    setData={_data => setData(_data)}
                    shouldLoadInitially
                    typeIRI={classIRI}
                    crudOptions={crudOptions}
                    defaultPrefix={defaultPrefix}
                    jsonldContext={defaultJsonldContext}
                    queryBuildOptions={defaultQueryBuilderOptions}
                    schema={loadedSchema as JSONSchema7}
                    jsonFormsProps={{
                      uischema: uischemaExternal || uischemas[typeName],
                      uischemas: uischemas
                    }}
                />}
              </Container>
            </>
          </WithPreviewForm>
      </>
  )
}

export default MainForm
