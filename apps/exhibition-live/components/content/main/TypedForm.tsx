import { Box, Button } from "@mui/material";
import { JSONSchema7 } from "json-schema";
import React, { useCallback, useMemo, useState } from "react";
import { SplitPane } from "react-collapse-pane";

import { BASE_IRI } from "../../config";
import ContentMainPreview from "../../content/ContentMainPreview";
import { defaultJsonldContext, defaultPrefix } from "../../form/formConfigs";
import { uischemata } from "../../form/uischemaForType";
import { uischemas } from "../../form/uischemas";
import { materialCategorizationStepperLayoutWithPortal } from "../../renderer/MaterialCategorizationStepperLayoutWithPortal";
import {
  useDrawerDimensions,
  useFormEditor,
  useGlobalSearch,
} from "../../state";
import useExtendedSchema from "../../state/useExtendedSchema";
import { useGlobalCRUDOptions } from "../../state/useGlobalCRUDOptions";
import { useSettings } from "../../state/useLocalSettings";
import { useRouter } from "next/router";
import { encodeIRI, irisToData } from "../../utils/core";
import NewSemanticJsonForm from "../../form/SemanticJsonForm";

type Props = {
  children: React.ReactChild;
  data: any;
  classIRI: string;
};
const WithPreviewForm = ({ classIRI, data, children }: Props) => {
  const isLandscape = false;
  const { previewEnabled, togglePreview, formData } = useFormEditor();
  const { features } = useSettings();

  return features?.enablePreview ? (
    <>
      <Button
        onClick={() => togglePreview()}
        style={{
          zIndex: 100,
          position: "absolute",
          left: "50%",
        }}
      >
        Vorschau {previewEnabled ? "ausblenden" : "einblenden"}
      </Button>
      {previewEnabled ? (
        <SplitPane split={isLandscape ? "horizontal" : "vertical"}>
          <div
            className={"page-wrapper"}
            style={{ overflow: "auto", height: "100%" }}
          >
            {children}
          </div>
          <div>
            {<ContentMainPreview classIRI={classIRI} exhibition={data} />}
          </div>
        </SplitPane>
      ) : (
        children
      )}
    </>
  ) : (
    <>{children}</>
  );
};
//const typeName = 'Exhibition'
//const classIRI = sladb.Exhibition.value

export type MainFormProps = {
  typeName: string;
  entityIRI?: string;
  classIRI: string;
};
const TypedForm = ({ typeName, entityIRI, classIRI }: MainFormProps) => {
  //const { formData: data, setFormData: setData } = useFormData();
  const [data, setData] = useState(irisToData(entityIRI, classIRI));
  const { crudOptions } = useGlobalCRUDOptions();
  const { search: searchText, setSearch } = useGlobalSearch();
  const router = useRouter();

  const handleChange = useCallback(
    (entityData: any) => {
      if (!entityData) return;
      const { "@id": entityIRI, "@type": typeIRI } = entityData;
      if (!entityIRI || !typeIRI) {
        return;
      }
      const typeName = typeIRI.substring(BASE_IRI.length, typeIRI.length);
      router.push(`/create/${typeName}/${encodeIRI(entityIRI)}`);
    },
    [setData, classIRI, router],
  );
  const handleSearchTextChange = useCallback(
    (searchText: string | undefined) => {
      setSearch(searchText);
    },
    [setSearch],
  );
  const loadedSchema = useExtendedSchema({ typeName, classIRI });

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
    <WithPreviewForm data={data} classIRI={classIRI}>
      {loadedSchema && (
        <Box sx={{ p: 2.5, display: "flex" }}>
          <NewSemanticJsonForm
            defaultEditMode={true}
            data={data}
            entityIRI={entityIRI}
            setData={handleChangeData}
            searchText={searchText}
            shouldLoadInitially
            typeIRI={classIRI}
            onEntityDataChange={handleChange}
            crudOptions={crudOptions}
            defaultPrefix={defaultPrefix}
            jsonldContext={defaultJsonldContext}
            schema={loadedSchema as JSONSchema7}
            jsonFormsProps={{
              uischema,
              uischemas: uischemas,
              renderers: mainFormRenderers,
            }}
            enableSidebar={true}
            wrapWithinCard={true}
          />
        </Box>
      )}
    </WithPreviewForm>
  );
};

export default TypedForm;
