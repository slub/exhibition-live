import {ControlProps, JsonSchema, resolveSchema} from '@jsonforms/core'
import {JSONSchema7} from 'json-schema'
import merge from 'lodash/merge'
import React, {useCallback, useMemo, useState} from 'react'

import DiscoverAutocompleteInput from '../form/discover/DiscoverAutocompleteInput'
import {defaultJsonldContext, defaultPrefix, defaultQueryBuilderOptions} from '../form/formConfigs'
import SemanticJsonForm, {CRUDOpsType} from '../form/SemanticJsonForm'
import {useUISchemaForType} from '../form/uischemaForType'
import {uischemas} from '../form/uischemas'
import MuiEditDialog from './MuiEditDialog'
import {useGlobalCRUDOptions} from "../state/useGlobalCRUDOptions";


type OwnProps = {
  open: boolean
  askClose: () => void
}
export const InlineSemanticFormsModal = (props: ControlProps & OwnProps) => {
  const {
    id,
      open,
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
    label,
      askClose
  } = props
  const isValid = errors.length === 0
  const appliedUiSchemaOptions = merge({}, config, uischema.options)
  const [formData, setFormData] = useState({'@id': data})
  const [CRUDOps, setCRUDOps] = useState<CRUDOpsType | undefined>()
  const {load, save, remove} = CRUDOps || {}
  const {crudOptions} = useGlobalCRUDOptions()
  const [editMode, setEditMode] = useState(false)

  const handleChange_ = useCallback(
      (v?: string) => {
        //FIXME: this is a workaround for a bug, that causes this to be called with the same value eternally
        if(v === data) return
        handleChange(path, v)
      },
      [path, handleChange, data],
  )


  const {$ref, typeIRI, useModal} = uischema.options?.context || {}
  const uischemaExternal = useUISchemaForType(typeIRI)

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
        //emitToSubscribers(subscriptionKeys.GLOBAL_DATA_CHANGE, subscriptions)
      },
      [save])
  const handleRemove = useCallback(
      async () => {
        if (!remove) return
        await remove()
      },
      [remove],
  )



  const handleEditToggle = useCallback(() => {
    console.log('handleEditToggle', editMode)
    setEditMode(!editMode)

  }, [editMode, setEditMode])
  return subSchema ? (
              <MuiEditDialog
                  title={label || ''}
                  open={open}
                  onClose={askClose}
                  onCancel={askClose}
                  onSave={handleSave}
                  onReload={load}
                  onEdit={handleEditToggle}
                  editMode={Boolean(editMode)}
                  search={
                    <DiscoverAutocompleteInput
                        typeIRI={typeIRI}
                        title={label || ''}
                        onSelectionChange={selection => handleChange_(selection?.value)}/>
                  }
                  onRemove={handleRemove}><>
                <SemanticJsonForm
                    data={formData}
                    forceEditMode={Boolean(editMode)}
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
                      uischema: uischemaExternal || undefined,
                      uischemas: uischemas
                    }}
                    onEntityChange={handleChange_}
                    onInit={(crudOps) => setCRUDOps(crudOps)}
                />
              </>
              </MuiEditDialog>
  ) : null
}

