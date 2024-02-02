import { JsonSchema } from "@jsonforms/core";
import { JSONSchema7 } from "json-schema";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import DiscoverAutocompleteInput from "../form/discover/DiscoverAutocompleteInput";
import { defaultJsonldContext, defaultPrefix } from "../form/formConfigs";
import { useUISchemaForType } from "../form/uischemaForType";
import { uischemas } from "../form/uischemas";
import MuiEditDialog from "./MuiEditDialog";
import { useGlobalCRUDOptions } from "../state/useGlobalCRUDOptions";
import { BASE_IRI } from "../config";
import { useControlled } from "@mui/material";
import { useCRUDWithQueryClient } from "../state/useCRUDWithQueryClient";
import { useSnackbar } from "notistack";
import NiceModal from "@ebay/nice-modal-react";
import GenericModal from "../form/GenericModal";
import { SemanticJsonFormNoOps } from "../form/SemanticJsonFormNoOps";
import { irisToData } from "../utils/core";
import { SemanticJsonFormsProps } from "../form/SemanticJsonForm";

type SemanticFormsModalProps = {
  label?: string;
  open: boolean;
  askClose: () => void;
  askCancel?: () => void;
  semanticJsonFormsProps?: Partial<SemanticJsonFormsProps>;
  schema: JsonSchema;
  entityIRI?: string;
  typeIRI: string;
  onChange?: (data: string | undefined) => void;
  formData?: any;
  onFormDataChange?: (data: any) => void;
  children?: React.ReactNode;
  formsPath?: string;
};
export const SemanticFormsModal = (props: SemanticFormsModalProps) => {
  const {
    open,
    schema,
    entityIRI,
    onChange,
    typeIRI,
    label,
    askClose,
    askCancel,
    semanticJsonFormsProps,
    formData: formDataProp,
    onFormDataChange,
    children,
    formsPath,
  } = props;
  const [formData, setFormData] = useControlled({
    name: "FormData",
    controlled: formDataProp,
    default: irisToData(entityIRI, typeIRI),
  });

  const [editMode, setEditMode] = useState(true);

  const uischemaExternal = typeIRI && useUISchemaForType(typeIRI);

  const { crudOptions } = useGlobalCRUDOptions();
  const { loadQuery, saveMutation, removeMutation } = useCRUDWithQueryClient(
    entityIRI,
    typeIRI,
    schema as JSONSchema7,
    defaultPrefix,
    crudOptions,
    defaultJsonldContext,
    { enabled: true },
  );
  const { data: remoteData } = loadQuery;

  useEffect(() => {
    if (remoteData) {
      const data = remoteData.document;
      if (!data || !data["@id"] || !data["@type"]) return;
      setFormData(data);
      onFormDataChange && onFormDataChange(data);
    }
  }, [remoteData, setFormData, onFormDataChange]);

  const { enqueueSnackbar } = useSnackbar();
  const handleSave = useCallback(async () => {
    saveMutation
      .mutateAsync(formData)
      .then(async (skipLoading?: boolean) => {
        enqueueSnackbar("Saved", { variant: "success" });
        !skipLoading && (await loadQuery.refetch());
        askClose();
      })
      .catch((e) => {
        enqueueSnackbar("Error while saving " + e.message, {
          variant: "error",
        });
      });
  }, [enqueueSnackbar, saveMutation, loadQuery, formData, askClose]);

  const handleRemove = useCallback(async () => {
    NiceModal.show(GenericModal, {
      type: "delete",
    }).then(() => {
      removeMutation.mutate();
      enqueueSnackbar("Removed", { variant: "success" });
      askClose();
    });
  }, [removeMutation]);

  const handleReload = useCallback(async () => {
    NiceModal.show(GenericModal, {
      type: "reload",
    }).then(() => {
      loadQuery.refetch();
    });
  }, [loadQuery]);

  const handleDataChange = useCallback(
    (data_: any) => {
      setFormData(data_);
      onFormDataChange && onFormDataChange(data_);
    },
    [setFormData, onFormDataChange],
  );

  const handleEditToggle = useCallback(() => {
    setEditMode(!editMode);
  }, [editMode, setEditMode]);
  return (
    <MuiEditDialog
      title={label || ""}
      open={open}
      onClose={askCancel}
      onCancel={askCancel}
      onSave={handleSave}
      onReload={handleReload}
      onEdit={handleEditToggle}
      editMode={editMode}
      actions={children}
      onRemove={handleRemove}
    >
      <>
        {schema && (
          <SemanticJsonFormNoOps
            {...semanticJsonFormsProps}
            data={formData}
            forceEditMode={Boolean(editMode)}
            onChange={handleDataChange}
            typeIRI={typeIRI}
            schema={schema as JSONSchema7}
            jsonFormsProps={{
              uischema: uischemaExternal || undefined,
              uischemas: uischemas,
            }}
            onEntityChange={onChange}
            formsPath={formsPath}
          />
        )}
      </>
    </MuiEditDialog>
  );
};
