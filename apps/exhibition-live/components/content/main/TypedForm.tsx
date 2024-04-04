import { Box, Grid } from "@mui/material";
import { JSONSchema7 } from "json-schema";
import React, { useCallback, useMemo, useState } from "react";
import { SplitPane } from "react-collapse-pane";

import { BASE_IRI } from "../../config";
import { defaultJsonldContext, defaultPrefix } from "../../form/formConfigs";
import { uischemata } from "../../form/uischemaForType";
import { uischemas } from "../../form/uischemas";
import { materialCategorizationStepperLayoutWithPortal } from "../../renderer/MaterialCategorizationStepperLayoutWithPortal";
import {
  useFormEditor,
  useGlobalSearch,
  useRightDrawerState,
} from "../../state";
import useExtendedSchema from "../../state/useExtendedSchema";
import { useGlobalCRUDOptions } from "../../state/useGlobalCRUDOptions";
import { useSettings } from "../../state/useLocalSettings";
import { encodeIRI, irisToData } from "../../utils/core";
import NewSemanticJsonForm from "../../form/SemanticJsonForm";
import { useModifiedRouter } from "../../basic";
import { EntityDetailElement } from "../../form/show";
import { RootFormProvider } from "../../provider";

type Props = {
  children: React.ReactChild;
  data: any;
  classIRI: string;
  entityIRI: string;
};
const WithPreviewForm = ({ classIRI, entityIRI, data, children }: Props) => {
  const isLandscape = false;
  const { previewEnabled, togglePreview, formData } = useFormEditor();
  const { features } = useSettings();
  const { width: rightDrawerWidth, open: rightDrawerOpen } =
    useRightDrawerState();
  const rightBoxWidth = useMemo(
    () => (rightDrawerOpen ? rightDrawerWidth + 10 : 0),
    [rightDrawerOpen, rightDrawerWidth],
  );

  return (
    <>
      <Grid
        container
        direction={isLandscape ? "column" : "row"}
        wrap="nowrap"
        sx={{ height: "100%" }}
      >
        <Grid item flex={1}>
          {children}
        </Grid>
        {features?.enablePreview && previewEnabled && (
          <Grid item flex={1}>
            <EntityDetailElement
              typeIRI={classIRI}
              entityIRI={entityIRI}
              data={data}
              cardActionChildren={null}
              readonly
            />
          </Grid>
        )}
        <Grid
          item
          sx={{
            width: rightBoxWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: rightBoxWidth,
              // boxSizing: 'border-box',
            },
          }}
        />
      </Grid>
    </>
  );
};

export type MainFormProps = {
  typeName: string;
  entityIRI?: string;
  classIRI: string;
};
const TypedForm = ({ typeName, entityIRI, classIRI }: MainFormProps) => {
  //const { formData: data, setFormData: setData } = useFormData();
  const [data, setData] = useState(irisToData(entityIRI, classIRI));
  const { search: searchText } = useGlobalSearch();
  const router = useModifiedRouter();

  const handleChange = useCallback(
    (entityData: any) => {
      if (!entityData) return;
      const { "@id": entityIRI, "@type": typeIRI } = entityData;
      if (!entityIRI || !typeIRI) {
        return;
      }
      const typeName = typeIRI.substring(BASE_IRI.length, typeIRI.length);
      router.push(`/create/${typeName}?encID=${encodeIRI(entityIRI)}`);
    },
    [router],
  );
  const loadedSchema = useExtendedSchema({ typeName, classIRI });

  const { width: rightDrawerWidth, open: rightDrawerOpen } =
    useRightDrawerState();
  const rightBoxWidth = useMemo(
    () => (rightDrawerOpen ? rightDrawerWidth + 10 : 0),
    [rightDrawerOpen, rightDrawerWidth],
  );

  //const { stepperRef, actionRef } = useFormRefsContext();
  const handleChangeData = useCallback(
    (data: any) => {
      setData(data);
    },
    [setData],
  );
  const mainFormRenderers = useMemo(() => {
    return [
      // @ts-ignore
      materialCategorizationStepperLayoutWithPortal(),
    ];
  }, []);

  const uischema = useMemo(
    () => uischemata[typeName] || (uischemas as any)[typeName],
    [typeName],
  );

  return (
    <RootFormProvider>
      <WithPreviewForm data={data} classIRI={classIRI} entityIRI={entityIRI}>
        {loadedSchema && (
          <Box sx={{ p: 2, display: "flex" }}>
            <NewSemanticJsonForm
              defaultEditMode={true}
              data={data}
              entityIRI={entityIRI}
              onChange={handleChangeData}
              searchText={searchText}
              shouldLoadInitially
              typeIRI={classIRI}
              onEntityDataChange={handleChange}
              defaultPrefix={defaultPrefix}
              jsonldContext={defaultJsonldContext}
              schema={loadedSchema as JSONSchema7}
              jsonFormsProps={{
                uischema,
                uischemas: uischemas,
                renderers: mainFormRenderers,
              }}
              enableSidebar={false}
              disableSimilarityFinder={true}
              wrapWithinCard={true}
            />
          </Box>
        )}
      </WithPreviewForm>
    </RootFormProvider>
  );
};

export default TypedForm;
