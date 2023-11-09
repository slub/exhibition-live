import { Button, Card, CardContent } from "@mui/material";
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
import { materialCategorizationStepperLayoutWithPortal } from "../../renderer/MaterialCategorizationStepperLayoutWithPortal";
import { useFormData, useFormEditor, useGlobalSearch } from "../../state";
import useExtendedSchema from "../../state/useExtendedSchema";
import { useGlobalCRUDOptions } from "../../state/useGlobalCRUDOptions";
import { useSettings } from "../../state/useLocalSettings";
import { useRouter } from "next/router";
import { encodeIRI } from "../../utils/core";

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
  classIRI: string;
};
const TypedForm = ({ typeName, classIRI }: MainFormProps) => {
  const { formData: data, setFormData: setData } = useFormData();
  const { crudOptions } = useGlobalCRUDOptions();
  const { search: searchText, setSearch } = useGlobalSearch();
  const router = useRouter();

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
  const actionButtonAreaRef = useRef<HTMLDivElement>();

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

  return (
    <WithPreviewForm data={data} classIRI={classIRI}>
      {loadedSchema && (
        <Card>
          <CardContent>
            <SemanticJsonForm
              defaultEditMode={true}
              data={data}
              entityIRI={data["@id"]}
              setData={handleChangeData}
              searchText={searchText}
              shouldLoadInitially
              typeIRI={classIRI}
              onEntityDataChange={handleChange}
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
                uischema: uischemata[typeName] || (uischemas as any)[typeName],
                uischemas: uischemas,
                renderers: mainFormRenderers,
              }}
            />
          </CardContent>
        </Card>
      )}
    </WithPreviewForm>
  );
};

export default TypedForm;
