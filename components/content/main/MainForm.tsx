import {prepareStubbedSchema} from '@graviola/crud-jsonforms'
import {Add as NewIcon} from '@mui/icons-material'
import {Button, Container, IconButton, TextField} from '@mui/material'
import {JSONSchema7} from 'json-schema'
import React, {useCallback, useState} from 'react'
import {SplitPane} from 'react-collapse-pane'
import {v4 as uuidv4} from 'uuid'

import {BASE_IRI} from '../../config'
import ContentMainPreview from '../../content/ContentMainPreview'
import DiscoverAutocompleteInput from '../../form/discover/DiscoverAutocompleteInput'
import {
  defaultJsonldContext,
  defaultPrefix,
  defaultQueryBuilderOptions,
  sladb
} from '../../form/formConfigs'
import SemanticJsonForm from '../../form/SemanticJsonForm'
import {useUISchemaForType} from '../../form/uischemaForType'
import {uischemas} from '../../form/uischemas'
import {useFormEditor, useOxigraph} from '../../state'
import useExtendedSchema from '../../state/useExtendedSchema'
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
  const [searchText, setSearchText] = useState<string | undefined>()

  const handleNew = useCallback(() => {
    const newURI = `${BASE_IRI}${uuidv4()}`
    const newData = {
      '@id': newURI,
      '@type': classIRI
    }
    setData(newData)
  }, [setData, classIRI])
  const handleChange = useCallback(
      (v?: string) => {
        if(!v) return
        console.log({v})
        setData((data: any) => ({
          ...data,
          '@id': v,
          '@type': classIRI,
        }))
      }, [setData, classIRI])
  const handleSearchTextChange = useCallback(
      (searchText: string | undefined) => {
        setSearchText(searchText)
      }, [setSearchText])
  const loadedSchema = useExtendedSchema({typeName, classIRI})
  const uischemaExternal = useUISchemaForType(classIRI)
  return (
      <>
        <Container>
          <DiscoverAutocompleteInput
              typeIRI={classIRI}
              condensed
              title={typeName || ''}
              typeName={typeName }
              onDebouncedSearchChange={handleSearchTextChange}
              onSelectionChange={selection => handleChange(selection?.value)}/>
          {features?.enableDebug && <TextField label={'ID'} value={data['@id']} onChange={e => handleChange(e.target.value)} fullWidth/>}
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
                    searchText={searchText}
                    shouldLoadInitially
                    typeIRI={classIRI}
                    crudOptions={crudOptions}
                    defaultPrefix={defaultPrefix}
                    jsonldContext={defaultJsonldContext}
                    queryBuildOptions={defaultQueryBuilderOptions}
                    schema={loadedSchema as JSONSchema7}
                    jsonFormsProps={{
                      uischema: uischemaExternal || (uischemas as any)[typeName],
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
