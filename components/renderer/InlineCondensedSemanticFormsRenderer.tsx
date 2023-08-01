import {
  ControlProps,
  findUISchema,
  JsonSchema,
  Resolve,
  resolveSchema
} from '@jsonforms/core'
import {
  useJsonForms,
  withJsonFormsControlProps
} from '@jsonforms/react'
import {FormControl, Grid, Hidden, IconButton} from '@mui/material'
import {JSONSchema7} from 'json-schema'
import merge from 'lodash/merge'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {v4 as uuidv4} from 'uuid'

import {defaultJsonldContext, defaultPrefix, defaultQueryBuilderOptions, slent} from '../form/formConfigs'
import SemanticJsonForm from '../form/SemanticJsonForm'
import {useUISchemaForType} from '../form/uischemaForType'
import {uischemas} from '../form/uischemas'
import {OpenInNew, OpenInNewOff} from "@mui/icons-material";
import DiscoverAutocompleteInput from "../form/discover/DiscoverAutocompleteInput";
import {useGlobalCRUDOptions} from "../state/useGlobalCRUDOptions";
import { InlineSemanticFormsModal } from "./InlineSemanticFormsModal";
import {BASE_IRI} from "../config";

const InlineCondensedSemanticFormsRenderer = (props: ControlProps) => {
  const {
    id,
    errors,
    schema,
    uischema,
    visible,
    required,
      renderers,
    config,
    data,
    handleChange,
    path,
    rootSchema,
    label,
    description
  } = props
  const isValid = errors.length === 0
  const appliedUiSchemaOptions = merge({}, config, uischema.options)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({'@id': data})
  const {crudOptions} = useGlobalCRUDOptions()
  const ctx = useJsonForms()
  const [realLabel, setRealLabel] = useState('')
  const [modalIsOpen, setModalIsOpen] = useState(false)

  const handleChange_ = useCallback(
      (v?: string) => {
        //FIXME: this is a workaround for a bug, that causes this to be called with the same value eternally
        if (v === data) return
        handleChange(path, v)
      },
      [path, handleChange, data],
  )

  useEffect(() => {
    let label_ = ''
    if (data) {
      const parentData = Resolve.data(ctx?.core?.data, path.substring(0, path.length - ('@id'.length + 1)))
      label_ = parentData?.label || parentData?.name || parentData?.title || parentData?.['@id']?.value || ''
    }
    setRealLabel(label_)
  }, [data, ctx?.core?.data, path, setRealLabel]);

  const newURI = useCallback(() => {
    if (!data) {
      const prefix = schema.title || slent[''].value
      const newURI = `${prefix}${uuidv4()}`
      handleChange_(newURI)
    }
  }, [schema, data, handleChange_])

  useEffect(() => {
    if (editMode)
      newURI()
  }, [newURI, editMode])

  const {$ref, typeIRI} = uischema.options?.context || {}
  const typeName = useMemo(() => typeIRI.substring(BASE_IRI.length, typeIRI.length), [typeIRI])
  const uischemaExternal = useUISchemaForType(typeIRI || '')

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

  const foundUISchema = useMemo(
      () =>
          findUISchema(
              uischemas || [],
              schema,
              uischema.scope,
              path,
              undefined,
              uischema,
              rootSchema
          ),
      [uischemas, schema, uischema.scope, path, uischema, rootSchema]
  )

  const handleToggle = useCallback(() => {
    setModalIsOpen(!modalIsOpen)
  }, [ setModalIsOpen, modalIsOpen])
  return (
      <Hidden xsUp={!visible}>
        <Grid container alignItems='baseline'>
          <Grid item flex={'auto'}>
            {!modalIsOpen && (realLabel ?
                <DiscoverAutocompleteInput
                    key={'not empty'}
                    loadOnStart={editMode}
                    readonly={Boolean(ctx.readonly)}
                    typeIRI={typeIRI}
                    title={label || ''}
                    typeName={typeName || ''}
                    defaultSelected={{value: data, label: `${realLabel}`}}
                    onSelectionChange={selection => handleChange_(selection?.value)}/>
                : <DiscoverAutocompleteInput
                    key={'empty'}
                    loadOnStart={true}
                    readonly={Boolean(ctx.readonly)}
                    typeIRI={typeIRI}
                    typeName={typeName || ''}
                    title={ label || ''}
                    onSelectionChange={selection => handleChange_(selection?.value)}/>)
            }
          </Grid>
          {!ctx.readonly && <Grid item>
            <IconButton onClick={(e) => { e.stopPropagation() ; handleToggle()}}>{modalIsOpen ? <OpenInNewOff/> : <OpenInNew />}</IconButton>
            <InlineSemanticFormsModal
                {...props}
                open={modalIsOpen}
                askClose={() => setModalIsOpen(false)}
                handleChange={(path, v) => {
                  handleChange_(v);
                }}
            />
          </Grid>}
        </Grid>


        <FormControl
            fullWidth={!appliedUiSchemaOptions.trim}
            id={id}
            variant={'standard'}
            sx={theme => ({marginBottom: theme.spacing(2)})}
            className={'inline_object_card'}
        >
          {subSchema && editMode && (
              <Grid container alignItems='baseline'>
                  <Grid item flex={'auto'}>
                  <SemanticJsonForm
                      readonly={false}
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

export default withJsonFormsControlProps(InlineCondensedSemanticFormsRenderer)
