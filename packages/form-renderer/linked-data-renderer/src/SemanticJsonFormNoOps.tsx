import { JsonFormsCore, JsonSchema } from "@jsonforms/core";
import { JsonForms } from "@jsonforms/react";
import { Card, CardContent, Grid } from "@mui/material";
import { merge } from "lodash";
import React, { FunctionComponent, useCallback, useMemo } from "react";
import NiceModal from "@ebay/nice-modal-react";
import {
  useAdbContext,
  useGlobalSearch,
  useRightDrawerState,
} from "@slub/edb-state-hooks";
import { OptionsModal } from "./OptionsModal";
import { useTranslation } from "next-i18next";
import { SearchbarWithFloatingButton } from "@slub/edb-basic-components";
import { SemanticJsonFormNoOpsProps } from "@slub/edb-global-types";

export type ChangeCause = "user" | "mapping" | "reload";

export const SemanticJsonFormNoOps: FunctionComponent<
  SemanticJsonFormNoOpsProps
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
    createEntityIRI,
    uiSchemaDefaultRegistry,
    rendererRegistry,
    cellRendererRegistry,
    primaryFieldRendererRegistry,
    components: { SimilarityFinder },
  } = useAdbContext();
  const searchOnDataPath = useMemo(() => {
    const typeName = typeIRIToTypeName(typeIRI);
    return primaryFields[typeName]?.label;
  }, [typeIRI, typeIRIToTypeName, primaryFields]);
  const primaryFieldRenderer = useMemo(
    () =>
      primaryFieldRendererRegistry ? primaryFieldRendererRegistry(typeIRI) : [],
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
        ],
      }).then((decision: string) => {
        closeDrawer();
        onChange((data: any) => {
          if (decision === "replace") {
            return {
              ...newData,
              "@id": data["@id"] || createEntityIRI(typeIRI),
              "@type": typeIRI,
            };
          } else {
            const computedData = merge(data, {
              ...newData,
              "@id": data["@id"] || createEntityIRI(typeIRI),
              "@type": typeIRI,
            });
            return computedData;
          }
        }, "mapping");
      });
    },
    [onChange, closeDrawer, t, createEntityIRI, typeIRI],
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
          <Card sx={{ padding: (theme) => theme.spacing(2) }}>
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
