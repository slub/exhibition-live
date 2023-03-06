import {JsonFormsUISchemaRegistryEntry} from '@jsonforms/core'
import {CreateNewFolder as NewIcon} from '@mui/icons-material'
import {Box, Button, Container, IconButton} from '@mui/material'
import {JSONSchema7} from 'json-schema'
import Head from 'next/head'
import {useCallback, useState} from 'react'
import {SplitPane} from 'react-collapse-pane'
import {v4 as uuidv4} from 'uuid'

import ContentMainPreview from '../components/content/ContentMainPreview'
import {
  defaultJsonldContext,
  defaultPrefix,
  defaultQueryBuilderOptions,
  exhibitionSchema
} from '../components/form/formConfigs'
import SemanticJsonForm from '../components/form/SemanticJsonForm'
import {uischemas} from '../components/form/uischemas'
import PerformanceFooter from '../components/layout/PerformanceFooter'
import PerformanceHeader from '../components/layout/PerformanceHeader'
import {useFormEditor} from '../components/state'
import {useSettings} from '../components/state/useLocalSettings'
import {oxigraphCrudOptions} from '../components/utils/sparql/remoteOxigraph'
import uischema from '../schema/exhibition-form-ui-schema-simple.json'
import styles from '../styles/Home.module.css'


const WithPreviewForm = ({ children }: { children: React.ReactChild}) => {
  const isLandscape = false
  const { previewEnabled, togglePreview,formData } = useFormEditor()


  return <>
    <Button onClick={() => togglePreview()} style={{zIndex: 100, position: 'absolute', left: '50%'}}  >Vorschau {previewEnabled ? 'ausblenden' : 'einblenden'}</Button>
    {previewEnabled
      ? <SplitPane split={isLandscape ? 'horizontal' : 'vertical'}>
        <div className={'page-wrapper'} style={{overflow: 'auto', height: '100%'}}>
            {children}
        </div>
        <div>
          {formData && <ContentMainPreview exhibition={formData} />}
        </div>
      </SplitPane>
      : <div className={'page-wrapper'}>{children}</div>}
  </>
}
const baseIRI = 'http://ontologies.slub-dresden.de/exhibition/entity#'
const classIRI = 'http://ontologies.slub-dresden.de/exhibition#Exhibition'
const exampleData = {
  '@id': `${baseIRI}b7748b40-b15b-4a6d-8f13-e65088232080`,
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
  const { activeEndpoint } = useSettings()
  const crudOptions = activeEndpoint && oxigraphCrudOptions(activeEndpoint.endpoint)
  const handleNew = useCallback(() => {
    const newURI = `${baseIRI}${uuidv4()}`
    setData({
      '@id': newURI,
      '@type': classIRI,
    })
  }, [setData])
  return (
      <>
        <Head>
          <title>Auststellungserfassung</title>
          <meta name="description" content="a knowledge base about exhibitions"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <link rel="icon" href="/favicon.ico"/>
        </Head>
        <main className={styles.main}>

            <>
              {/* Page header */}
              <PerformanceHeader/>
              {/* Content wrapper */}
              <Container className="default-wrapper">
                {/* Header area for content */}
                <IconButton onClick={handleNew} aria-label={'neuen Eintrag erstellen'}><NewIcon /></IconButton>
                <SemanticJsonForm
                    data={data}
                    entityIRI={data['@id']}
                    setData={_data => setData(_data)}
                    shouldLoadInitially
                    typeIRI='http://ontologies.slub-dresden.de/exhibition#Exhibition'
                    crudOptions={crudOptions}
                    defaultPrefix={defaultPrefix}
                    jsonldContext={defaultJsonldContext}
                    queryBuildOptions={defaultQueryBuilderOptions}
                    schema={exhibitionSchema as JSONSchema7}
                    jsonFormsProps={{
                      uischema,
                      uischemas: uischemas
                    }}
                />
              </Container>
              {/* Page footer */}
              <PerformanceFooter/>
            </>
        </main>
      </>
  )
}
