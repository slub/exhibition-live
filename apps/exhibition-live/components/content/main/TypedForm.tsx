import { Button, Grid, TextField } from "@mui/material";
import { JSONSchema7 } from "json-schema";
import React, { useCallback, useMemo, useRef } from "react";
import { SplitPane } from "react-collapse-pane";
import { v4 as uuidv4 } from "uuid";

import { BASE_IRI } from "../../config";
import ContentMainPreview from "../../content/ContentMainPreview";
import {
  defaultJsonldContext,
  defaultPrefix,
  defaultQueryBuilderOptions,
} from "../../form/formConfigs";
import SemanticJsonForm from "../../form/SemanticJsonForm";
import { uischemata } from "../../form/uischemaForType";
import { uischemas } from "../../form/uischemas";
import { useFormRefsContext } from "../../provider/formRefsContext";
import { materialCategorizationStepperLayoutWithPortal } from "../../renderer/MaterialCategorizationStepperLayoutWithPortal";
import {
  useFormData,
  useFormEditor,
  useGlobalSearch,
  useOxigraph,
} from "../../state";
import useExtendedSchema from "../../state/useExtendedSchema";
import { useGlobalCRUDOptions } from "../../state/useGlobalCRUDOptions";
import { useSettings } from "../../state/useLocalSettings";
import SPARQLLocalOxigraphToolkit from "../../utils/dev/SPARQLLocalOxigraphToolkit";

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
  defaultData?: any;
  typeName: string;
  classIRI: string;
};
const oxigraph = false
const TypedForm = ({ defaultData, typeName, classIRI }: MainFormProps) => {
  const { formData: data, setFormData: setData } = useFormData();
  //const { oxigraph } = useOxigraph();
  const { crudOptions, doLocalQuery } = useGlobalCRUDOptions();
  const { features } = useSettings();
  const { search: searchText, setSearch } = useGlobalSearch();

  const handleNew = useCallback(() => {
    const newURI = `${BASE_IRI}${uuidv4()}`;
    const newData = {
      "@id": newURI,
      "@type": classIRI,
      title: searchText,
    };
    setData(newData);
  }, [setData, classIRI, searchText]);
  const handleChange = useCallback(
    (v?: string) => {
      if (!v) return;
      setData((data: any) => ({
        ...data,
        "@id": v,
        "@type": classIRI,
      }));
    },
    [setData, classIRI],
  );
  const handleSearchTextChange = useCallback(
    (searchText: string | undefined) => {
      setSearch(searchText);
    },
    [setSearch],
  );
  const loadedSchema = useExtendedSchema({ typeName, classIRI });
  const stepperAreaRef = useRef<HTMLDivElement>();
  const actionButtonAreaRef = useRef<HTMLDivElement>();

  const { stepperRef, actionRef } = useFormRefsContext();
  const handleChangeData = useCallback(
    (data: any) => {
      setData(data);
    },
    [setData],
  );
  const mainFormRenderers = useMemo(() => {
    return [
      materialCategorizationStepperLayoutWithPortal(
        stepperRef?.current,
        actionRef?.current,
      ),
    ];
  }, [stepperRef, actionRef]);

  return (
    <>
      {features?.enableDebug && (
        <TextField
          label={"ID"}
          value={data["@id"]}
          onChange={(e) => handleChange(e.target.value)}
          fullWidth
        />
      )}
      <WithPreviewForm data={data} classIRI={classIRI}>
        <Grid container spacing={0} direction={"column"}>
          <Grid item>
            {oxigraph && features?.enableDebug && (
              <SPARQLLocalOxigraphToolkit sparqlQuery={doLocalQuery} />
            )}
            {loadedSchema && (
              <SemanticJsonForm
                defaultEditMode={true}
                data={data}
                entityIRI={data["@id"]}
                setData={handleChangeData}
                searchText={searchText}
                shouldLoadInitially
                typeIRI={classIRI}
                crudOptions={crudOptions}
                defaultPrefix={defaultPrefix}
                jsonldContext={defaultJsonldContext}
                queryBuildOptions={defaultQueryBuilderOptions}
                schema={loadedSchema as JSONSchema7}
                toolbarChildren={
                  <span
                    ref={actionButtonAreaRef}
                    style={{ float: "right" }}
                  ></span>
                }
                jsonFormsProps={{
                  uischema:
                    uischemata[typeName] || (uischemas as any)[typeName],
                  uischemas: uischemas,
                  renderers: mainFormRenderers,
                }}
              />
            )}
          </Grid>
        </Grid>
      </WithPreviewForm>
    </>
  );
};

export default TypedForm;
