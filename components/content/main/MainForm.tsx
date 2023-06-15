import {Add as NewIcon, Send} from '@mui/icons-material'
import {Button, Container, Grid,IconButton, TextField} from '@mui/material'
import {useQuery} from '@tanstack/react-query'
import {JSONSchema7} from 'json-schema'
import React, {useCallback, useMemo, useState} from 'react'
import {SplitPane} from 'react-collapse-pane'
import {v4 as uuidv4} from 'uuid'

import {BASE_IRI, ROOT_SCHEMA_URL} from '../../config'
import ContentMainPreview from '../../content/ContentMainPreview'
import {
  defaultJsonldContext,
  defaultPrefix,
  defaultQueryBuilderOptions,
  sladb,
  slent
} from '../../form/formConfigs'
import {bringDefinitionsToTop, prepareStubbedSchema} from '../../form/jsonforms/schemaUtils'
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

const IRIChooser = ({iri, onChange}: { iri: string, onChange: (iri: string) => void }) => {
  const [id, setId] = useState('')//data['@id']?.substring(data['@id']?.lastIndexOf('#') + 1, data['@id'].length))
 return <Container>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField label={'ID'} value={id} onChange={e => setId(e.target.value)} />
        <IconButton onClick={() => onChange(slent(id).value)}
                    aria-label={'URI generieren'}><Send/></IconButton>
      </Grid>
      <Grid item xs={12}>
        <TextField label={'URI'} value={iri} onChange={e => onChange(e.target.value)}
                   fullWidth/>
      </Grid>
    </Grid>
  </Container>
}
const MainForm = ({defaultData}: MainFormProps) => {
  const [data, setData] = useState<any>(defaultData)
  const {oxigraph} = useOxigraph()
  const {crudOptions, doLocalQuery} = useGlobalCRUDOptions()
  const {features} = useSettings()

  const handleNew = useCallback(() => {
    const newURI = `${BASE_IRI}${uuidv4()}`
    setData({
      '@id': newURI,
      '@type': classIRI,
    })
  }, [setData])
  const {data: loadedSchema} = useQuery(['schema', typeName], () => fetch(ROOT_SCHEMA_URL).then(async res => {
    const jsonData: any = await res.json()
    if (!jsonData) return
    const schema = prepareStubbedSchema(jsonData)
    return bringDefinitionsToTop(schema, typeName)
  }))

  const uischemata = useMemo(() => loadedSchema ? uischemas(loadedSchema) : [], [loadedSchema])
  const uischemaExternal = useUISchemaForType(classIRI)
  return (
      <>
        <WithPreviewForm data={data} classIRI={classIRI}>
          <>
            {features?.enableDebug && <IRIChooser iri={data?.['@id']} onChange={iri => setData({...data, '@id': iri})}/>}
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
                    uischemas: uischemata
                  }}
              />}
            </Container>
          </>
        </WithPreviewForm>
      </>
  )
}

export default MainForm
