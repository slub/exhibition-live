import {Add as NewIcon} from '@mui/icons-material'
import {Button, Container, IconButton} from '@mui/material'
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
const exampleData = {
  '@id': slent['b7748b40-b15b-4a6d-8f13-e65088232080'].value,
  '@type': classIRI,
  'title': 'Otto Dix Ausstellung',
  'subtitle': 'Das neue Metrum',
  'description': 'Eine kontemporaere Ausstellung',
  'startDate': {
    'date': '2016-09-22',
    'modifier': 'AFTER'
  },
  'endDate': {
    'date': '2016-09-27',
    'modifier': 'AFTER'
  }
}

export type MainFormProps = {

}
const MainForm = (props: MainFormProps) => {
  const [data, setData] = useState<any>(exampleData)
  const {bulkLoaded} = useRDFDataSources('./ontology/exhibition-info.owl.ttl')
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
    return {
      ...jsonData,
      ...(jsonData.$defs?.[typeName] || {})
    }
  }))
  const uischemaExternal = useUISchemaForType(classIRI)
  return (
      <>
          <WithPreviewForm data={data} classIRI={classIRI}>
            <>
              <Container className="default-wrapper">

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
                      uischema: uischemaExternal || undefined,
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
