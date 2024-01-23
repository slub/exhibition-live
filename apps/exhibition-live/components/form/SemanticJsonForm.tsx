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
import { SemanticJsonFormNoOps } from "./SemanticJsonFormNoOps";
import { SemanticJsonFormToolbar } from "./SemanticJsonFormToolbar";
import { useSettings } from "../state/useLocalSettings";
import { useQueryKeyResolver } from "../state";
import { Backdrop, Box, CircularProgress } from "@mui/material";
import { EntityDetailModal } from "./show";

export type CRUDOpsType = {
  load: () => Promise<void>;
  save: () => Promise<void>;
  remove: () => Promise<void>;
};

export interface SemanticJsonFormsProps {
  entityIRI?: string | undefined;
  data: any;
  setData: (data: any) => void;
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

const SemanticJsonForm: FunctionComponent<SemanticJsonFormsProps> = ({
  entityIRI,
  data,
  setData,
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
  const [grandOperationIsLoading, setGrandOperationLoading] = useState(false);
  const isLoading = useMemo(
    () =>
      loadQuery.isLoading || saveMutation.isLoading || grandOperationIsLoading,
    [loadQuery.isLoading, saveMutation.isLoading, grandOperationIsLoading],
  );
  useEffect(() => {
    if (loadQuery.data) {
      const data = loadQuery.data.document;
      updateSourceToTargets(entityIRI, loadQuery.data.subjects);
      if (!data["@id"] || !data["@type"]) return;
      setData(data);
    }
  }, [loadQuery.data, entityIRI, setData, updateSourceToTargets]);

  useEffect(() => {
    return () => {
      removeSource(entityIRI);
    };
  }, [entityIRI, removeSource]);

  useEffect(() => {
    if (!entityIRI) return;
    loadQuery.refetch();
  }, [entityIRI, loadQuery]);

  const handleReset = useCallback(() => {
    NiceModal.show(GenericModal, {
      type: "reset",
    }).then(() => {
      setData({});
    });
  }, [setData]);

  const handleSave = useCallback(async () => {
    setGrandOperationLoading(true);
    saveMutation
      .mutateAsync(data)
      .then(async () => {
        setData({});
        loadQuery.remove();
        setTimeout(() => {
          enqueueSnackbar("Saved", { variant: "success" });
          loadQuery.refetch().finally(() => {
            setGrandOperationLoading(false);
          });
        }, 10);
      })
      .catch((e) => {
        enqueueSnackbar("Error while saving " + e.message, {
          variant: "error",
        });
      });
  }, [
    setGrandOperationLoading,
    enqueueSnackbar,
    saveMutation,
    loadQuery,
    data,
    setData,
  ]);

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
      setGrandOperationLoading(true);
      loadQuery.remove();
      setData({});
      loadQuery.refetch().finally(() => {
        setGrandOperationLoading(false);
      });
    });
  }, [loadQuery, setData, setGrandOperationLoading]);

  const handleToggleEditMode = useCallback(() => {
    setEditMode((prev) => !prev);
  }, [setEditMode]);

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
        onChange={setData}
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
