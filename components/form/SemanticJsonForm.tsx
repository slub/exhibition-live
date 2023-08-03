import 'react-json-view-lite/dist/index.css'

import {
  isObjectArray,
  isObjectArrayControl,
  JsonFormsCore,
  JsonSchema,
  rankWith, schemaMatches,
  scopeEndsWith,
  UISchemaElement
} from '@jsonforms/core'
import {materialCells, materialRenderers} from '@jsonforms/material-renderers'
import {JsonForms, JsonFormsInitStateProps} from '@jsonforms/react'
import {Close,Delete, Edit, EditOff, Refresh, Save} from '@mui/icons-material'
import {Button, Grid, Hidden, IconButton, Switch} from '@mui/material'
import {JSONSchema7} from 'json-schema'
import {JsonLdContext} from 'jsonld-context-parser'
import {isEmpty} from 'lodash'
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react'
import {JsonView} from 'react-json-view-lite'

import {BASE_IRI} from '../config'
import AdbSpecialDateRenderer, {adbSpecialDateControlTester} from '../renderer/AdbSpecialDateRenderer'
import AutoIdentifierRenderer from '../renderer/AutoIdentifierRenderer'
import ImageRenderer from '../renderer/ImageRenderer'
import InlineCondensedSemanticFormsRenderer from '../renderer/InlineCondensedSemanticFormsRenderer'
import InlineSemanticFormsRenderer from '../renderer/InlineSemanticFormsRenderer'
import MaterialArrayOfLinkedItemRenderer from '../renderer/MaterialArrayOfLinkedItemRenderer'
import MaterialCustomAnyOfRenderer, {materialCustomAnyOfControlTester} from '../renderer/MaterialCustomAnyOfRenderer'
import MaterialLinkedObjectRenderer, {
  materialLinkedObjectControlTester,
} from '../renderer/MaterialLinkedObjectRenderer'
import TypeOfRenderer from '../renderer/TypeOfRenderer'
import {useJsonldParser} from '../state/useJsonldParser'
import {useSettings} from '../state/useLocalSettings'
import {CRUDOptions, SparqlBuildOptions, useSPARQL_CRUD} from '../state/useSPARQL_CRUD'
import {emitToSubscribers, subscriptionKeys, useSubscriptions} from '../state/useSubscriptions'
import SimilarityFinder from './SimilarityFinder'

export type CRUDOpsType = {
  load: () => Promise<void>
  save: () => Promise<void>
  remove: () => Promise<void>
}

interface OwnProps {
  entityIRI?: string | undefined
  data: any,
  setData: (data: any) => void
  shouldLoadInitially?: boolean
  typeIRI: string
  schema: JSONSchema7
  jsonldContext: JsonLdContext
  defaultPrefix: string
  debugEnabled?: boolean
  crudOptions?: Partial<CRUDOptions>
  queryBuildOptions?: SparqlBuildOptions
  jsonFormsProps?: Partial<JsonFormsInitStateProps>
  onEntityChange?: (entityIRI: string | undefined) => void
  onInit?: (crudOps: CRUDOpsType) => void
  hideToolbar?: boolean
  readonly?: boolean
  forceEditMode?: boolean
  searchText?: string
  parentIRI?: string
}

export type SemanticJsonFormsProps = OwnProps;

const renderers = [
  ...materialRenderers,
  {
    tester: materialCustomAnyOfControlTester,
    renderer: MaterialCustomAnyOfRenderer
  },
  {
    tester: rankWith(10,
        scopeEndsWith('image')
    ),
    renderer: ImageRenderer
  },
  {
    tester: rankWith(10,
        scopeEndsWith('@id')
    ),
    renderer: AutoIdentifierRenderer
  }, {
    tester: rankWith(10,
        scopeEndsWith('@type')
    ),
    renderer: TypeOfRenderer
  }, {
    tester: rankWith(5, isObjectArray),
    renderer: MaterialArrayOfLinkedItemRenderer
  }, {
    tester: rankWith(13,
        (uischema: UISchemaElement): boolean => {
          if (isEmpty(uischema)) {
            return false
          }
          const options = uischema.options
          return !isEmpty(options) && options['inline']
        }),
    renderer: InlineSemanticFormsRenderer
  }, {
    tester: rankWith(14,
        (uischema: UISchemaElement, schema, ctx): boolean => {
          if (isEmpty(uischema) || isObjectArrayControl(uischema, schema, ctx)) {
            return false
          }
          const options = uischema.options
          return !isEmpty(options) && options['inline']
        }),
    renderer: InlineCondensedSemanticFormsRenderer
  }, {
    tester: adbSpecialDateControlTester,
    renderer: AdbSpecialDateRenderer
  },
  {
    tester: materialLinkedObjectControlTester,
    renderer: MaterialLinkedObjectRenderer
  }
]


const infuserOptions = {
  omitEmptyArrays: true,
  omitEmptyObjects: true,
  maxRecursionEachRef: 2,
  maxRecursion: 2
}


const SemanticJsonForm: FunctionComponent<SemanticJsonFormsProps> =
    ({
       entityIRI,
       data,
       setData,
       shouldLoadInitially,
       typeIRI,
       defaultPrefix,
       schema,
       jsonldContext,
       crudOptions = {},
       queryBuildOptions,
       jsonFormsProps = {},
       onEntityChange,
       onInit,
       hideToolbar,
       readonly,
       forceEditMode,
       searchText,
        parentIRI
     }) => {
      const [jsonldData, setJsonldData] = useState<any>({})
      //const {formData, setFormData} = useFormEditor()
      const [formData, setFormData] = useState<any | undefined>()
      const [initiallyLoaded, setInitiallyLoaded] = useState<string | undefined>(undefined)
      const [jsonViewerEnabled, setJsonViewerEnabled] = useState(false)
      const [managedEditMode, setEditMode] = useState(false)
      const editMode = useMemo(() => forceEditMode || managedEditMode, [managedEditMode, forceEditMode])
      const [hideSimilarityFinder, setHideSimilarityFinder] = useState(true)
      const {subscribe, unsubscribe, subscriptions} = useSubscriptions()
      const [subscription, setSubscription] = useState<string | undefined>()
      const {features} = useSettings()
      const typeName = useMemo(() => typeIRI.substring(BASE_IRI.length, typeIRI.length), [typeIRI])

      const {parseJSONLD} = useJsonldParser(
          data,
          jsonldContext,
          schema,
          {
            onJsonldData: setJsonldData,
            onFormDataChange: setFormData,
            walkerOptions: infuserOptions,
            defaultPrefix
          })

      useEffect(() => {
        // onEntityChange && onEntityChange(entityIRI)
      }, [entityIRI, setData])

      const ownIRI = useMemo(() => entityIRI || jsonldData['@id'], [entityIRI, jsonldData])


      const {
        exists,
        load,
        save,
        remove,
        isUpdate,
        setIsUpdate,
        ready
      } = useSPARQL_CRUD(
          ownIRI,
          typeIRI,
          schema,
          //@ts-ignore
          {
            ...crudOptions,
            defaultPrefix,
            setData: setData,
            data: jsonldData,
            queryBuildOptions
          })


      useEffect(() => {
        if (!ready) return
        const testExistenceAndLoad = async () => {
          if (!entityIRI || !shouldLoadInitially || initiallyLoaded === entityIRI)
            return
          setIsUpdate(await exists())
          await load()
          setInitiallyLoaded(entityIRI)
        }
        setTimeout(() => testExistenceAndLoad(), 1)
        //todo why is it necessary
        //testExistenceAndLoad()
      }, [entityIRI, shouldLoadInitially, exists, load, initiallyLoaded, setInitiallyLoaded])


      const handleFormChange = useCallback(
          (state: Pick<JsonFormsCore, 'data' | 'errors'>) => {
            setData((oldState: any) => {
              if (oldState.name !== state.data.name) {
                setHideSimilarityFinder(false)
              }
              return state.data
            })
          }, [setData, setHideSimilarityFinder])

      useEffect(() => {
        if (searchText && searchText.length > 0) {
          setHideSimilarityFinder(false)
        }
      }, [searchText, setHideSimilarityFinder])


      const handleNewData = useCallback(
          (newData: any) => {
            if (!newData) return
            setData(newData)
          }, [setData])

      useEffect(() => {
        parseJSONLD(data)
      }, [data, parseJSONLD])

      useEffect(() => {
        if (onInit) {
          onInit({load, save, remove})
        }
      }, [onInit, load, save, remove])

      const handleSave = useCallback(async () => {
        await save()
        await load()
        console.log('will emit')
        emitToSubscribers(subscriptionKeys.GLOBAL_DATA_CHANGE, subscriptions)
        setEditMode(false)
      }, [save, setEditMode, subscriptions])

      const saveAndLoadFromCB = useCallback(
          async() => {
            console.log('callback called')
            await save()
            await load()
          },
          [save, load]
      )


      useEffect(() => {
        subscription && unsubscribe(subscriptionKeys.GLOBAL_DATA_CHANGE, subscription)
        setSubscription(subscribe(subscriptionKeys.GLOBAL_DATA_CHANGE,
          saveAndLoadFromCB
        ))
        return () => {
          subscription && unsubscribe(subscriptionKeys.GLOBAL_DATA_CHANGE, subscription)
        }
      }, [subscription, subscribe, unsubscribe, saveAndLoadFromCB])


      return (<>
            <Hidden xsUp={hideToolbar}>
              <IconButton onClick={() => setEditMode(editMode => !editMode)}>{editMode ? <EditOff/> :
                  <Edit/>}</IconButton>
              {editMode && <>
                  <Button onClick={handleSave} startIcon={<Save/>}>speichern</Button>
                  <Button onClick={remove} startIcon={<Delete/>}>entfernen</Button>
                  <Button onClick={load} startIcon={<Refresh/>}>neu laden</Button>
              </>}
              {features?.enableDebug && <>
                  <Switch checked={jsonViewerEnabled} onChange={e => setJsonViewerEnabled(Boolean(e.target.checked))}
                          title={'debug'}/>
                {jsonViewerEnabled &&
                    <Switch checked={isUpdate} onChange={e => setIsUpdate(Boolean(e.target.checked))}
                            title={'upsert'}/>}
              </>
              }
            </Hidden>
            <Grid container spacing={2}>
              <Grid item xs={12} md={hideSimilarityFinder ? undefined : 8} lg={ hideSimilarityFinder ? undefined : 6} flexGrow={1}>
                <JsonForms
                    readonly={!editMode}
                    data={data}
                    renderers={renderers}
                    cells={materialCells}
                    onChange={handleFormChange}
                    schema={schema as JsonSchema}
                    {...jsonFormsProps}

                />
                {jsonViewerEnabled && [data, jsonldData, formData].map((data_, idx) => (<>
                  {entityIRI}
                  <JsonView key={idx} data={data_} shouldInitiallyExpand={(lvl) => lvl < 5}/>
                  <hr/>
                </>))}
              </Grid>
              {!hideSimilarityFinder && <>
                  <Grid item xs={12} lg={6} md={4}>
                      <IconButton onClick={() => setHideSimilarityFinder(true)} sx={{position: 'absolute'}}><Close /></IconButton>
                      <SimilarityFinder
                          search={searchText}
                          data={data}
                          classIRI={typeIRI}
                          jsonSchema={schema}
                          onEntityIRIChange={onEntityChange}
                          onMappedDataAccepted={handleNewData}/>
                  </Grid>
              </>
              }
            </Grid>
          </>
      )
    }

export default SemanticJsonForm
