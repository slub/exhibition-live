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
import {Edit, EditOff} from '@mui/icons-material'
import {Button, Hidden, IconButton, Switch} from '@mui/material'
import {JSONSchema7} from 'json-schema'
import {JsonLdContext} from 'jsonld-context-parser'
import {isEmpty} from 'lodash'
import React, {FunctionComponent, useCallback, useEffect, useState} from 'react'
import {JsonView} from 'react-json-view-lite'

import AutocompleteGNDFieldRenderer from '../renderer/AutocompleteGNDFieldRenderer'
import AutocompleteURIFieldRenderer from '../renderer/AutocompleteURIFieldRenderer'
import AutoIdentifierRenderer from '../renderer/AutoIdentifierRenderer'
import InlineSemanticFormsRenderer from '../renderer/InlineSemanticFormsRenderer'
import MaterialArrayOfLinkedItemRenderer from '../renderer/MaterialArrayOfLinkedItemRenderer'
import MaterialCustomAnyOfRenderer, {materialCustomAnyOfControlTester} from '../renderer/MaterialCustomAnyOfRenderer'
import TypeOfRenderer from '../renderer/TypeOfRenderer'
import {useJsonldParser} from '../state/useJsonldParser'
import {CrudOptions, SparqlBuildOptions, useSPARQL_CRUD} from '../state/useSPARQL_CRUD'

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
    crudOptions?: Partial<CrudOptions>
    queryBuildOptions?:  SparqlBuildOptions
    jsonFormsProps?: Partial<JsonFormsInitStateProps>
    onEntityChange?: (entityIRI: string | undefined) => void
    onInit?: (crudOps: CRUDOpsType) => void
    hideToolbar?: boolean
    readonly?: boolean
}

type Props = OwnProps;

const renderers = [
    ...materialRenderers,
    {
        tester: materialCustomAnyOfControlTester,
        renderer: MaterialCustomAnyOfRenderer
    }, {
        tester: rankWith(15,
            schemaMatches(
                schema =>
                    Boolean(!isEmpty(schema) &&
                        schema.format?.startsWith('gndo'))
            )),
        renderer: AutocompleteGNDFieldRenderer,
    }, {
        tester: rankWith(15,
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
    }, {
        tester: rankWith(10,
            scopeEndsWith('@type')
        ),
        renderer: TypeOfRenderer
    },{
        tester: rankWith(5, isObjectArray),
        renderer: MaterialArrayOfLinkedItemRenderer
    }, {
        tester: rankWith(10,
            (uischema: UISchemaElement): boolean => {
                if (isEmpty(uischema)) {
                    return false
                }

                const options = uischema.options
                return !isEmpty(options) && options['inline']
            }),
        renderer: InlineSemanticFormsRenderer
    }
]


const infuserOptions = {
    omitEmptyArrays: true,
    omitEmptyObjects: true,
    maxRecursionEachRef: 5,
    maxRecursion: 8
}


const SemanticJsonForm: FunctionComponent<Props> =
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
     }) => {
        const [jsonldData, setJsonldData] = useState<any>({})
        //const {formData, setFormData} = useFormEditor()
        const [formData, setFormData] = useState<any | undefined>()
        const [initiallyLoaded, setInitiallyLoaded] = useState<string | undefined>(undefined)
        const [editMode, setEditMode ] =useState(!Boolean(readonly))
        const [debugEnabled, setDebugEnabled ] =useState(false)


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
            onEntityChange && onEntityChange(entityIRI)
        }, [entityIRI])


        const {
            exists,
            load,
            save,
            remove,
            isUpdate,
            setIsUpdate
        } = useSPARQL_CRUD(
            entityIRI,
            typeIRI,
            schema,
            // @ts-ignore
            {
                ...crudOptions,
                defaultPrefix,
                setData: setData,
                data: jsonldData,
                queryBuildOptions
            })


        useEffect(() => {
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
                setData(state.data)
            }, [setData])

        useEffect(() => {
            parseJSONLD(data)
        }, [data, parseJSONLD])

        useEffect(() => {
            if(onInit) {
                onInit({load, save, remove})
            }
        }, [onInit, load, save, remove])

      const handleSave = useCallback(async () => {
        await save()
        setEditMode(false)
      }, [save, setEditMode])


        return (<>
            <Hidden xsUp={hideToolbar}>
                <IconButton onClick={() => setEditMode(editMode => !editMode)}>{editMode ? <EditOff/> : <Edit/>}</IconButton>
              {editMode && <>
                <Button onClick={handleSave}>speichern</Button>
                <Button onClick={remove}>entfernen</Button>
                <Button onClick={load}>laden</Button>
              </>}
                <Switch checked={debugEnabled} onChange={e => setDebugEnabled(Boolean(e.target.checked))} title={'debug'}/>
              {debugEnabled && <>
                <Switch checked={isUpdate} onChange={e => setIsUpdate(Boolean(e.target.checked))} title={'upsert'}/>
              </>
              }
            </Hidden>
                <JsonForms
                    readonly={!editMode}
                    data={data}
                    renderers={renderers}
                    cells={materialCells}
                    onChange={handleFormChange}
                    schema={schema as JsonSchema}
                    {...jsonFormsProps}

                />
                {debugEnabled && [data, jsonldData, formData].map((data_, idx) => (<>
                    <JsonView key={idx} data={data_} shouldInitiallyExpand={(lvl) => lvl < 5}/>
                    <hr/>
                </>))}
            </>
        )
    }

export default SemanticJsonForm
