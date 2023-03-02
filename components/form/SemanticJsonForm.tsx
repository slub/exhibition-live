import 'react-json-view-lite/dist/index.css'

import {JsonFormsCore, JsonFormsUISchemaRegistryEntry, JsonSchema, rankWith, scopeEndsWith} from '@jsonforms/core'
import {materialCells, materialRenderers} from '@jsonforms/material-renderers'
import {JsonForms} from '@jsonforms/react'
import {Button, Switch} from '@mui/material'
import {JSONSchema7} from 'json-schema'
import {JsonLdContext} from 'jsonld-context-parser'
import React, {FunctionComponent, useCallback, useEffect, useState} from 'react'
import {JsonView} from 'react-json-view-lite'

import uischema from '../../schema/exhibition-form-ui-schema-simple.json'
import personschema from '../../schema/exhibition-person-ui-schema-simple.json'
import AutoIdentifierRenderer from '../renderer/AutoIdentifierRenderer'
import MaterialCustomAnyOfRenderer, {materialCustomAnyOfControlTester} from '../renderer/MaterialCustomAnyOfRenderer'
import {MaterialListWithDetailRenderer, materialListWithDetailTester} from '../renderer/MaterialListWithDetailRenderer'
import {useFormEditor} from '../state'
import {useJsonldParser} from '../state/useJsonldParser'
import {CrudOptions, SparqlBuildOptions, useSPARQL_CRUD} from '../state/useSPARQL_CRUD'


interface OwnProps {
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
}

type Props = OwnProps;

const renderers = [
    ...materialRenderers,
    {
        tester: materialCustomAnyOfControlTester,
        renderer: MaterialCustomAnyOfRenderer
    }, /*{
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
    }, */ {
        tester: rankWith(10,
            scopeEndsWith('@id')
        ),
        renderer: AutoIdentifierRenderer
    }, {
        tester: materialListWithDetailTester,
        renderer: MaterialListWithDetailRenderer
    }
]

const uiSchemas: JsonFormsUISchemaRegistryEntry[] = [
    {
        tester: (schema, schemaPath, path) => {
            return schema.properties?.['@type']?.const === 'http://ontologies.slub-dresden.de/exhibition#Person' ? 11 : -1
        },
        uischema: personschema
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
         data,
         setData,
         shouldLoadInitially,
         typeIRI,
         defaultPrefix,
         schema,
         jsonldContext,
         debugEnabled,
        crudOptions = {},
        queryBuildOptions
     }) => {
        const [jsonldData, setJsonldData] = useState<any>({})
        const {formData, setFormData} = useFormEditor()
        const [initiallyLoaded, setInitiallyLoaded] = useState<string | undefined>(undefined)

        const {entityIRI, parseJSONLD} = useJsonldParser(
            data,
            jsonldContext,
            schema,
            {
                onJsonldData: setJsonldData,
                onFormDataChange: setFormData,
                walkerOptions: infuserOptions,
                defaultPrefix
            })

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
                console.log('check')
                console.log({entityIRI, shouldLoadInitially, initiallyLoaded})
                if (!entityIRI || !shouldLoadInitially || initiallyLoaded === entityIRI)
                    return
                console.log('start')
                setIsUpdate(await exists())
                await load()
                setInitiallyLoaded(entityIRI)
            }
            console.log('init')
            testExistenceAndLoad()
        }, [entityIRI, shouldLoadInitially, exists, load, initiallyLoaded, setInitiallyLoaded])


        const handleFormChange = useCallback(
            (state: Pick<JsonFormsCore, 'data' | 'errors'>) => {
                setData(state.data)
            }, [setData])

        useEffect(() => {
            parseJSONLD(data)
        }, [data, parseJSONLD])


        return (<>
                <Button onClick={save}>speichern</Button>
                <Button onClick={remove}>entfernen</Button>
                <Button onClick={load}>laden</Button>
                <Switch checked={isUpdate} onChange={e => setIsUpdate(Boolean(e.target.checked))} title={'upsert'}/>
                <JsonForms
                    data={data}
                    renderers={renderers}
                    cells={materialCells}
                    onChange={handleFormChange}
                    schema={schema as JsonSchema}
                    uischema={uischema}
                    uischemas={uiSchemas}

                />
                <Button onClick={save}>speichern</Button>
                {debugEnabled && <>
                    <JsonView data={data} shouldInitiallyExpand={(lvl) => lvl < 5}/>
                    <hr/>
                    <JsonView data={jsonldData} shouldInitiallyExpand={(lvl) => lvl < 5}/>
                    <hr/>
                    <JsonView data={formData || {}} shouldInitiallyExpand={(lvl) => lvl < 5}/>
                </>}
            </>
        )
    }

export default SemanticJsonForm