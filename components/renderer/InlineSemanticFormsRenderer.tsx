import {ControlProps, JsonSchema, resolveSchema} from '@jsonforms/core'
import {withJsonFormsControlProps} from '@jsonforms/react'
import {FormControl, Grid, Hidden} from '@mui/material'
import {JSONSchema7} from 'json-schema'
import merge from 'lodash/merge'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {v4 as uuidv4} from 'uuid'

import {defaultJsonldContext, defaultPrefix, defaultQueryBuilderOptions, slent} from '../form/formConfigs'
import SemanticJsonForm from '../form/SemanticJsonForm'
import {useUISchemaForType} from '../form/uischemaForType'
import {uischemas} from '../form/uischemas'
import {useSettings} from '../state/useLocalSettings'
import {oxigraphCrudOptions} from '../utils/sparql/remoteOxigraph'
import {useGlobalCRUDOptions} from "../state/useGlobalCRUDOptions";

const InlineSemanticFormsRenderer = (props: ControlProps) => {
    const {
        id,
        errors,
        schema,
        uischema,
        visible,
        required,
        config,
        data,
        handleChange,
        path,
        rootSchema,
        label
    } = props
    const isValid = errors.length === 0
    const appliedUiSchemaOptions = merge({}, config, uischema.options)
    const [editMode, setEditMode] = useState(false)
    const [formData, setFormData] = useState({'@id': data})
    const {crudOptions} = useGlobalCRUDOptions()

    const handleChange_ = useCallback(
        (v?: string) => {
            //FIXME: this is a workaround for a bug, that causes this to be called with the same value eternally
            if(v === data) return
            handleChange(path, v)
        },
        [path, handleChange, data],
    )

    //console.log({config})

    const init = useCallback(() => {
        if (!data && !editMode) {
            const prefix = schema.title || slent[''].value
            const newURI = `${prefix}${uuidv4()}`
            handleChange_(newURI)
            console.log({data})
        }
    }, [schema, data, handleChange_])

    useEffect(() => {
        init()
    }, [init])

    const {$ref, typeIRI} = uischema.options?.context || {}
    const uischemaExternal =  useUISchemaForType(typeIRI || '')

    const subSchema = useMemo(() => {
        if (!$ref) return
        const schema2 = {
            ...schema,
            $ref
        }
        const resolvedSchema = resolveSchema(schema2 as JsonSchema, '', rootSchema as JsonSchema)
        return {
            ...rootSchema,
            ...resolvedSchema
        }
    }, [$ref, schema, rootSchema])


    return (
        <Hidden xsUp={!visible}>
            <FormControl
                fullWidth={!appliedUiSchemaOptions.trim}
                id={id}
                variant={'standard'}
                sx={theme => ({marginBottom: theme.spacing(2)})}
            >
                {subSchema && (
                        <Grid container alignItems='baseline'>
                            <Grid item flex={'auto'}>
                                <SemanticJsonForm
                                    readonly={!editMode}
                                    data={formData}
                                    entityIRI={data}
                                    setData={_data => setFormData(_data)}
                                    shouldLoadInitially
                                    typeIRI={typeIRI}
                                    crudOptions={crudOptions}
                                    defaultPrefix={defaultPrefix}
                                    jsonldContext={defaultJsonldContext}
                                    queryBuildOptions={defaultQueryBuilderOptions}
                                    schema={subSchema as JSONSchema7}
                                    jsonFormsProps={{
                                        uischema: uischemaExternal || undefined,
                                        uischemas: uischemas
                                    }}
                                    onEntityChange={handleChange_}
                                />
                            </Grid>
                        </Grid>)
                }
            </FormControl>
        </Hidden>
    )
}

export default withJsonFormsControlProps(InlineSemanticFormsRenderer)
