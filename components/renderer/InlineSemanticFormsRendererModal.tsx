import {ControlProps, JsonSchema, resolveSchema} from '@jsonforms/core'
import {withJsonFormsControlProps} from '@jsonforms/react'
import {Edit, EditOff} from '@mui/icons-material'
import {FormControl, Grid, Hidden, IconButton} from '@mui/material'
import {JSONSchema7} from 'json-schema'
import merge from 'lodash/merge'
import React, {useCallback, useMemo, useState} from 'react'
import {v4 as uuidv4} from 'uuid'

import DiscoverAutocompleteInput from '../form/discover/DiscoverAutocompleteInput'
import {defaultJsonldContext, defaultPrefix, defaultQueryBuilderOptions} from '../form/formConfigs'
import SemanticJsonForm, {CRUDOpsType} from '../form/SemanticJsonForm'
import {uischemaForType} from '../form/uischemaForType'
import {uischemas} from '../form/uischemas'
import {useLocalSettings, useSettings} from '../state/useLocalSettings'
import {oxigraphCrudOptions} from '../utils/sparql/remoteOxigraph'
import MuiEditDialog from './MuiEditDialog'

const InlineSemanticFormsRendererModal = (props: ControlProps) => {
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
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [formData, setFormData] = useState({'@id': data})
  const [CRUDOps, setCRUDOps] = useState<CRUDOpsType | undefined>()
  const {load, save, remove} = CRUDOps || {}
  const {activeEndpoint} = useSettings()
  const crudOptions = activeEndpoint && oxigraphCrudOptions(activeEndpoint.endpoint)

  const handleChange_ = useCallback(
      (v?: string) => {
        handleChange(path, v)
      },
      [path, handleChange],
  )

  //console.log({config})

  const handleToggle = useCallback(() => {
    const prefix = schema.title || 'http://ontologies.slub-dresden.de/exhibition/entity#'
    if (!data && !modalIsOpen) {
      const newURI = `${prefix}${uuidv4()}`
      handleChange_(newURI)
      console.log({data})
    }
    setModalIsOpen(!modalIsOpen)
  }, [schema, data, handleChange_, setModalIsOpen, modalIsOpen])

  const {$ref, typeIRI, useModal} = uischema.options?.context || {}

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

  const handleSave = useCallback(
      async () => {
        if (!save) return
        await save()
        setModalIsOpen(false)
      },
      [save, setModalIsOpen])
  const handleRemove = useCallback(
      async () => {
        if (!remove) return
        await remove()
        setModalIsOpen(false)
      },
      [remove, setModalIsOpen],
  )


  return (
      <Hidden xsUp={!visible}>
        <FormControl
            fullWidth={!appliedUiSchemaOptions.trim}
            id={id}
            variant={'standard'}
            sx={theme => ({marginBottom: theme.spacing(2)})}
        >
          <IconButton onClick={(e) => { e.stopPropagation() ; handleToggle()}}>{modalIsOpen ? <EditOff/> : <Edit/>}</IconButton>
          {modalIsOpen && subSchema && (
              <MuiEditDialog
                  title={label || ''}
                  open={modalIsOpen}
                  onClose={handleToggle}
                  onCancel={handleToggle}
                  onSave={handleSave}
                  onReload={load}
                  search={<>
                    <DiscoverAutocompleteInput
                        typeIRI={typeIRI}
                        title={label || ''}
                        onSelectionChange={selection => handleChange_(selection?.value)}/>
                  </>}
                  onRemove={handleRemove}><>
                <SemanticJsonForm
                    data={formData}
                    hideToolbar={true}
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
                      uischema: uischemaForType(typeIRI),
                      uischemas: uischemas
                    }}
                    onEntityChange={entityIRI => {
                      handleChange_(entityIRI)
                      console.log({entityIRI});
                    }}
                    onInit={(crudOps) => setCRUDOps(crudOps)}
                />
              </>
              </MuiEditDialog>)}
        </FormControl>
      </Hidden>
  )
}

export default withJsonFormsControlProps(InlineSemanticFormsRendererModal)
