import "react-json-view-lite/dist/index.css";

import NiceModal from "@ebay/nice-modal-react";
import { JsonFormsInitStateProps } from "@jsonforms/react";
import { JSONSchema7 } from "json-schema";
import { JsonLdContext } from "jsonld-context-parser";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { CRUDOptions } from "../state/useSPARQL_CRUD";
import { FormDebuggingTools } from "./FormDebuggingTools";
import GenericModal from "./GenericModal";
import { cleanJSONLD } from "../utils/crud";
import { useCRUDWithQueryClient } from "../state/useCRUDWithQueryClient";
import { useSnackbar } from "notistack";
import { ChangeCause, SemanticJsonFormNoOps } from "./SemanticJsonFormNoOps";
import { SemanticJsonFormToolbar } from "./SemanticJsonFormToolbar";
import { useSettings } from "../state/useLocalSettings";
import { useQueryKeyResolver } from "../state";
import { Backdrop, Box, CircularProgress } from "@mui/material";
import { EntityDetailModal } from "./show";
import { create } from "zustand";
import { useTranslation } from "next-i18next";

export type CRUDOpsType = {
  load: () => Promise<void>;
  save: () => Promise<void>;
  remove: () => Promise<void>;
};

export interface SemanticJsonFormsProps {
  entityIRI?: string | undefined;
  data: any;
  onChange: (data: any) => void;
  shouldLoadInitially?: boolean;
  typeIRI: string;
  schema: JSONSchema7;
  jsonldContext: JsonLdContext;
  debugEnabled?: boolean;
  jsonFormsProps?: Partial<JsonFormsInitStateProps>;
  onEntityChange?: (entityIRI: string | undefined) => void;
  onEntityDataChange?: (entityData: any) => void;
  defaultPrefix: string;
  crudOptions: Partial<CRUDOptions>;
  hideToolbar?: boolean;
  forceEditMode?: boolean;
  defaultEditMode?: boolean;
  searchText?: string;
  toolbarChildren?: React.ReactNode;
  disableSimilarityFinder?: boolean;
  enableSidebar?: boolean;
  wrapWithinCard?: boolean;
}

type SemanticJsonFormStateType = {
  isSaving: boolean;
  isLoading: boolean;
  isEditing: boolean;
  setData: (data: any, cause: ChangeCause) => void;
  data: any;
};

const useSemanticJsonFormState = create<SemanticJsonFormStateType>(
  (set, get) => ({
    isSaving: false,
    isEditing: false,
    isLoading: false,
    data: {},
    setData: (data: any, cause: ChangeCause) => {
      if (cause === "user" && !get().isSaving) {
        set({ data });
      }
      if (cause === "mapping") {
        set({ data });
      }
      if (cause === "reload" && !get().isLoading && !get().isEditing) {
        set({ data });
      }
    },
  }),
);
const SemanticJsonForm: FunctionComponent<SemanticJsonFormsProps> = ({
  entityIRI,
  data,
  onChange,
  shouldLoadInitially,
  typeIRI,
  schema,
  jsonldContext,
  jsonFormsProps = {},
  hideToolbar,
  forceEditMode,
  defaultEditMode,
  toolbarChildren,
  defaultPrefix,
  crudOptions,
  ...rest
}) => {
  const { t } = useTranslation();
  const [managedEditMode, setEditMode] = useState(defaultEditMode || false);
  const editMode = useMemo(
    () =>
      (typeof forceEditMode !== "boolean" && managedEditMode) || forceEditMode,
    [managedEditMode, forceEditMode],
  );
  const { enqueueSnackbar } = useSnackbar();

  const { loadQuery, existsQuery, saveMutation, removeMutation } =
    useCRUDWithQueryClient(
      entityIRI,
      typeIRI,
      schema,
      defaultPrefix,
      crudOptions,
      jsonldContext,
      { enabled: false },
      "rootLoad",
    );

  const { updateSourceToTargets, removeSource } = useQueryKeyResolver();
  const [isSaving, setIsSaving] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const isLoading = useMemo(
    () =>
      loadQuery.isLoading || saveMutation.isLoading || isSaving || isReloading,
    [loadQuery.isLoading, saveMutation.isLoading, isSaving, isReloading],
  );
  useEffect(() => {
    if (loadQuery.data) {
      const data = loadQuery.data.document;
      updateSourceToTargets(entityIRI, loadQuery.data.subjects);
      if (!data["@id"] || !data["@type"]) return;
      onChange(data);
    }
  }, [loadQuery.data, entityIRI, onChange, updateSourceToTargets]);

  useEffect(() => {
    return () => {
      removeSource(entityIRI);
    };
  }, [entityIRI, removeSource]);

  useEffect(() => {
    if (!entityIRI) return;
    loadQuery.refetch().finally(() => {
      console.log("initially loaded", entityIRI);
    });
  }, [entityIRI, loadQuery.refetch]);

  const handleReset = useCallback(() => {
    NiceModal.show(GenericModal, {
      type: "reset",
    }).then(() => {
      onChange({});
    });
  }, [onChange]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    saveMutation
      .mutateAsync(data)
      .then(async () => {
        //TODO should we clear and refetch? or just refetch?
        onChange({});
        loadQuery.remove();
        setTimeout(() => {
          loadQuery.refetch().finally(() => {
            setTimeout(() => {
              enqueueSnackbar("Saved", { variant: "success" });
              setIsSaving(false);
            }, 10);
          });
        }, 10);
      })
      .catch((e) => {
        setIsSaving(false);
        enqueueSnackbar("Error while saving " + e.message, {
          variant: "error",
        });
      });
  }, [setIsSaving, enqueueSnackbar, saveMutation, loadQuery, data, onChange]);

  const handleRemove = useCallback(async () => {
    NiceModal.show(GenericModal, {
      type: "delete",
    }).then(() => {
      removeMutation.mutate();
    });
  }, [removeMutation]);

  const handleReload = useCallback(async () => {
    NiceModal.show(GenericModal, {
      type: "reload",
    }).then(() => {
      setIsReloading(true);
      loadQuery.remove();
      onChange({});
      loadQuery.refetch().finally(() => {
        setTimeout(() => {
          enqueueSnackbar(t("reloaded"), { variant: "success" });
          setIsReloading(false);
        }, 1000);
      });
    });
  }, [loadQuery, onChange, setIsReloading, enqueueSnackbar, t]);

  const handleToggleEditMode = useCallback(() => {
    setEditMode((prev) => !prev);
  }, [setEditMode]);

  //the cleaned data is the form data ran through the json schema based parser and the json to JSONLD converter
  const [cleanedData, setCleanedData] = useState({});
  const {
    features: { enableDebug },
  } = useSettings();
  useEffect(() => {
    if (!data || !enableDebug) return;
    try {
      cleanJSONLD(data, schema, {
        jsonldContext,
        defaultPrefix,
        keepContext: true,
      }).then((cleanedData) => {
        setCleanedData(cleanedData);
      });
    } catch (e) {
      setCleanedData({
        error: "Error while cleaning JSON-LD ",
        message: e.message,
      });
    }
  }, [enableDebug, data, schema, jsonldContext, defaultPrefix]);

  const handleShowEntry = useCallback(() => {
    NiceModal.show(EntityDetailModal, {
      typeIRI,
      entityIRI: entityIRI,
    });
  }, [typeIRI, entityIRI]);

  const handleOnChange = useCallback(
    (data: any, reason: ChangeCause) => {
      if (reason === "user" && editMode && !isLoading) {
        onChange(data);
      } else if (reason === "mapping" && !isLoading) {
        onChange(data);
      } else if (reason === "reload" && isReloading) {
        onChange(data);
      }
    },
    [onChange, editMode, isLoading, isReloading],
  );

  return (
    <Box sx={{ minHeight: "100%", width: "100%" }}>
      <FormDebuggingTools
        jsonData={{
          formData: data,
          cleanedData,
        }}
      />
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <SemanticJsonFormNoOps
        typeIRI={typeIRI}
        data={data}
        onChange={handleOnChange}
        schema={schema}
        formsPath="root"
        jsonFormsProps={{
          readonly: !editMode,
          ...(jsonFormsProps || {}),
        }}
        toolbar={
          !hideToolbar && (
            <SemanticJsonFormToolbar
              editMode={editMode}
              onEditModeToggle={handleToggleEditMode}
              onReset={handleReset}
              onSave={handleSave}
              onRemove={handleRemove}
              onReload={handleReload}
              onShow={handleShowEntry}
            >
              {toolbarChildren}
            </SemanticJsonFormToolbar>
          )
        }
        {...rest}
      />
    </Box>
  );
};

export default SemanticJsonForm;
