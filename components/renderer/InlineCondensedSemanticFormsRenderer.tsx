import {ControlProps, findUISchema, JsonSchema, Resolve, resolveSchema} from '@jsonforms/core'
import {useJsonForms, withJsonFormsControlProps} from '@jsonforms/react'
import {FormControl, Grid, Hidden, IconButton} from '@mui/material'
import merge from 'lodash/merge'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {v4 as uuidv4} from 'uuid'

import {slent} from '../form/formConfigs'
import {useUISchemaForType} from '../form/uischemaForType'
import {uischemas} from '../form/uischemas'
import {Add, OpenInNew, OpenInNewOff} from "@mui/icons-material";
import DiscoverAutocompleteInput from "../form/discover/DiscoverAutocompleteInput";
import {useGlobalCRUDOptions} from "../state/useGlobalCRUDOptions";
import {InlineSemanticFormsModal} from "./InlineSemanticFormsModal";
import {BASE_IRI} from "../config";
import {AutocompleteSuggestion} from "../form/DebouncedAutoComplete";

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

  const handleSelectedChange = useCallback(
      (v: AutocompleteSuggestion) => {
        //FIXME: this is a workaround for a bug, that causes this to be called with the same value eternally
        if (v.value !== data) handleChange(path, v.value)
        setRealLabel(v.label)
      },
      [path, handleChange, data, setRealLabel],
  )

  useEffect(() => {
    setRealLabel(_old => {
      if ((_old && _old.length > 0) || !data) return _old
      const parentData = Resolve.data(ctx?.core?.data, path.substring(0, path.length - ('@id'.length + 1)))
      return parentData?.label || parentData?.name || parentData?.title || parentData?.['@id']?.value || ''
    })
  }, [data, ctx?.core?.data, path, setRealLabel]);

  const newURI = useCallback(() => {
    const prefix = schema.title || slent[''].value
    const newURI = `${prefix}${uuidv4()}`
    handleSelectedChange({value: newURI, label: ''})
  }, [schema, data, handleSelectedChange])

  useEffect(() => {
    if (editMode && !data)
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
  }, [setModalIsOpen, modalIsOpen])

  const handleAddNew = useCallback(() => {
    newURI()
    setModalIsOpen(true)
  }, [setModalIsOpen, newURI])
  return (
      <Hidden xsUp={!visible}>
        <Grid container alignItems='baseline'>
          <Grid item flex={'auto'}>
            <DiscoverAutocompleteInput
                key={'not empty'}
                loadOnStart={editMode}
                readonly={Boolean(ctx.readonly)}
                typeIRI={typeIRI}
                title={label || ''}
                typeName={typeName || ''}
                defaultSelected={{value: data, label: `${realLabel}`}}
                selected={{value: data, label: `${realLabel}`}}
                onSelectionChange={selection => handleSelectedChange(selection)}/>
          </Grid>
          {!ctx.readonly && <Grid item>
              <Grid container direction='column'>
                {(typeof data == 'string' && data.length > 0) && <Grid item>
                    <IconButton
                        sx={{padding: 0}}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle()
                        }}>{modalIsOpen ? <OpenInNewOff/> : <OpenInNew/>}</IconButton>
                </Grid>}
                  <Grid item>
                      <IconButton
                          sx={{padding: 0}}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddNew()
                          }}>{<Add/>}</IconButton>
                  </Grid>
              </Grid>
              <InlineSemanticFormsModal
                  {...props}
                  open={modalIsOpen}
                  askClose={() => setModalIsOpen(false)}
                  handleChange={(path, v) => {
                    handleSelectedChange({value: v, label: ''})
                  }}
                  semanticJsonFormsProps={{
                    onLoad: (data: any) => {
                      //TODO: generalize label handling, this is bad practise and not very fexible!
                      const label = data?.label || data?.name || data?.title || ''
                      handleSelectedChange({value: data['@id'], label})
                    }
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

        </FormControl>
      </Hidden>
  )
}

export default withJsonFormsControlProps(InlineCondensedSemanticFormsRenderer)
