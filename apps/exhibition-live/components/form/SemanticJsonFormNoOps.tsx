import { JsonFormsCore, JsonSchema } from "@jsonforms/core";
import { JsonForms, JsonFormsInitStateProps } from "@jsonforms/react";
import { Card, CardContent, Grid } from "@mui/material";
import { JSONSchema7 } from "json-schema";
import { merge } from "lodash";
import React, { FunctionComponent, useCallback, useMemo } from "react";
import SimilarityFinder from "./SimilarityFinder";
import { SearchbarWithFloatingButton } from "../layout/main-layout/Searchbar";
import NiceModal from "@ebay/nice-modal-react";
import {
  useAdbContext,
  useGlobalSearch,
  useRightDrawerState,
} from "@slub/edb-state-hooks";
import { ErrorObject } from "ajv";
import { OptionsModal } from "./OptionsModal";
import { useTranslation } from "next-i18next";

export type ChangeCause = "user" | "mapping" | "reload";

export interface SemanticJsonFormsNoOpsProps {
  typeIRI: string;
  data: any;
  onChange?: (data: any, reason: ChangeCause) => void;
  onError?: (errors: ErrorObject[]) => void;
  schema: JSONSchema7;
  jsonFormsProps?: Partial<JsonFormsInitStateProps>;
  onEntityChange?: (entityIRI: string | undefined) => void;
  onEntityDataChange?: (entityData: any) => void;
  toolbar?: React.ReactNode;
  forceEditMode?: boolean;
  defaultEditMode?: boolean;
  searchText?: string;
  disableSimilarityFinder?: boolean;
  enableSidebar?: boolean;
  wrapWithinCard?: boolean;
  formsPath?: string;
}

export const SemanticJsonFormNoOps: FunctionComponent<
  SemanticJsonFormsNoOpsProps
> = ({
  data,
  onChange,
  onError,
  typeIRI,
  schema,
  jsonFormsProps = {},
  onEntityDataChange,
  toolbar,
  searchText,
  disableSimilarityFinder,
  enableSidebar,
  wrapWithinCard,
  formsPath,
}) => {
  const {
    queryBuildOptions: { primaryFields },
    typeIRIToTypeName,
    uiSchemaDefaultRegistry,
    rendererRegistry,
    cellRendererRegistry,
    primaryFieldRendererRegistry,
  } = useAdbContext();
  const searchOnDataPath = useMemo(() => {
    const typeName = typeIRIToTypeName(typeIRI);
    return primaryFields[typeName]?.label;
  }, [typeIRI, typeIRIToTypeName, primaryFields]);
  const primaryFieldRenderer = useMemo(
    () =>
      primaryFieldRendererRegistry
        ? primaryFieldRendererRegistry(typeIRI) || []
        : [],
    [typeIRI, primaryFieldRendererRegistry],
  );

  const handleFormChange = useCallback(
    (state: Pick<JsonFormsCore, "data" | "errors">) => {
      onChange && onChange(state.data, "user");
      if (onError) onError(state.errors || []);
    },
    [onChange, onError],
  );

  const { closeDrawer } = useRightDrawerState();
  const { t } = useTranslation();

  const handleMappedData = useCallback(
    (newData: any) => {
      if (!newData) return;
      //avoid overriding of id and type by mapped data
      NiceModal.show(OptionsModal, {
        id: "confirm-mapping-dialog",
        content: {
          title: t("merge-or-replace"),
          text: t("confirm-mapping-dialog-message"),
        },
        options: [
          {
            title: t("replace data"),
            value: "replace",
          },
          {
            title: t("merge data"),
            value: "merge",
          },
        ],
      }).then((decision: string) => {
        closeDrawer();
        onChange((data: any) => {
          if (decision === "replace") {
            return {
              ...newData,
              "@id": data["@id"],
              "@type": data["@type"],
            };
          } else {
            const computedData = merge(data, {
              ...newData,
              "@id": data["@id"],
              "@type": data["@type"],
            });
            return computedData;
          }
        }, "mapping");
      });
    },
    [onChange, closeDrawer, t],
  );

  const handleEntityIRIChange = useCallback(
    (iri) => {
      onEntityDataChange &&
        onEntityDataChange({ "@id": iri, "@type": typeIRI });
      closeDrawer();
    },
    [onEntityDataChange, typeIRI, closeDrawer],
  );

  const WithCard = useMemo(
    () =>
      ({ children }: { children: React.ReactNode }) =>
        wrapWithinCard ? (
          <Card>
            <CardContent>{children}</CardContent>
          </Card>
        ) : (
          children
        ),
    [wrapWithinCard],
  );
  const {
    cells: jfpCells,
    renderers: jfpRenderers,
    config,
    ...jfpProps
  } = jsonFormsProps;
  const finalJsonFormsProps = {
    ...jfpProps,
    uischemas: uiSchemaDefaultRegistry,
    config: {
      ...config,
      formsPath,
      typeIRI,
    },
  };
  const allRenderer = useMemo(
    () => [
      ...(rendererRegistry || []),
      ...(jfpRenderers || []),
      ...primaryFieldRenderer,
    ],
    [jfpRenderers, primaryFieldRenderer, rendererRegistry],
  );
  const allCellRenderer = useMemo(
    () => [...(cellRendererRegistry || []), ...(jfpCells || [])],
    [cellRendererRegistry, jfpCells],
  );
  const { path: globalPath } = useGlobalSearch();

  return (
    <Grid container spacing={0}>
      <Grid item flex={1}>
        <Grid container spacing={0}>
          <Grid
            item
            xs={
              disableSimilarityFinder || enableSidebar || !searchText ? 12 : 6
            }
          >
            <WithCard>
              {toolbar ? toolbar : null}
              <JsonForms
                data={data}
                renderers={allRenderer}
                cells={allCellRenderer}
                onChange={handleFormChange}
                schema={schema as JsonSchema}
                {...finalJsonFormsProps}
              />
            </WithCard>
          </Grid>
          {!disableSimilarityFinder && !enableSidebar && searchText && (
            <Grid xs={6} item>
              <SimilarityFinder
                finderId={formsPath}
                search={searchText}
                data={data}
                classIRI={typeIRI}
                jsonSchema={schema}
                onEntityIRIChange={handleEntityIRIChange}
                searchOnDataPath={searchOnDataPath}
                onMappedDataAccepted={handleMappedData}
              />
            </Grid>
          )}
        </Grid>
      </Grid>
      {formsPath === globalPath && (
        <Grid item>
          <SearchbarWithFloatingButton>
            <SimilarityFinder
              finderId={formsPath}
              search={searchText}
              data={data}
              classIRI={typeIRI}
              jsonSchema={schema}
              onEntityIRIChange={handleEntityIRIChange}
              searchOnDataPath={searchOnDataPath}
              onMappedDataAccepted={handleMappedData}
              hideFooter
            />
          </SearchbarWithFloatingButton>{" "}
        </Grid>
      )}
    </Grid>
  );
};
