import {AddBox as NewIcon} from '@mui/icons-material'
import {Button, Container, IconButton} from '@mui/material'
import {useQuery} from '@tanstack/react-query'
import {JSONSchema7} from 'json-schema'
import Head from 'next/head'
import React, {useCallback, useState} from 'react'
import {SplitPane} from 'react-collapse-pane'
import {v4 as uuidv4} from 'uuid'

import {BASE_IRI} from '../components/config'
import ContentMainPreview from '../components/content/ContentMainPreview'
import SettingsModal from '../components/content/settings/SettingsModal'
import {
  defaultJsonldContext,
  defaultPrefix,
  defaultQueryBuilderOptions,
  sladb, slent
} from '../components/form/formConfigs'
import SemanticJsonForm from '../components/form/SemanticJsonForm'
import {useUISchemaForType} from '../components/form/uischemaForType'
import {uischemas} from '../components/form/uischemas'
import PerformanceFooter from '../components/layout/PerformanceFooter'
import PerformanceHeader from '../components/layout/PerformanceHeader'
import {useFormEditor} from '../components/state'
import {useSettings} from '../components/state/useLocalSettings'
import {oxigraphCrudOptions} from '../components/utils/sparql/remoteOxigraph'
import styles from '../styles/Home.module.css'

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
            : children }
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
export default () => {
  const [data, setData] = useState<any>(exampleData)
  const {activeEndpoint} = useSettings()
  const crudOptions = activeEndpoint && oxigraphCrudOptions(activeEndpoint.endpoint)
  const handleNew = useCallback(() => {
    const newURI = `${BASE_IRI}${uuidv4()}`
    setData({
      '@id': newURI,
      '@type': classIRI,
    })
  }, [setData])
  const {data: loadedSchema} = useQuery(['schema', typeName], () => fetch(`../schema/${typeName}.schema.json`).then(async res => {
    const jsonData: any = await res.json()
    if (!jsonData) return
    const result = {
      ...jsonData,
      ...(jsonData.$defs?.[typeName] || {})
    }
    console.log('loadedSchema', result)
    return result
  }))
  const uischemaExternal = useUISchemaForType(classIRI)
  return (
      <>
        <Head>
          <title>Auststellungserfassung</title>
          <meta name="description" content="a knowledge base about exhibitions"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <link rel="icon" href="/favicon.ico"/>
        </Head>
        <PerformanceHeader/>
        <main className={styles.main}>

          <WithPreviewForm data={data} classIRI={classIRI}>
            <>
              {/* Page header */}
              {/* Content wrapper */}
              <Container className="default-wrapper">
                {/* Header area for content */}
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
              {/* Page footer */}
              <PerformanceFooter/>
            </>
          </WithPreviewForm>
        </main>
      </>
  )
}
