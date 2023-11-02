import "react-json-view-lite/dist/index.css";

import {
  isObjectArray,
  isObjectArrayControl,
  JsonFormsCore,
  JsonSchema,
  rankWith,
  scopeEndsWith,
  UISchemaElement,
} from "@jsonforms/core";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms, JsonFormsInitStateProps } from "@jsonforms/react";
import {
  Close,
  Delete,
  Edit,
  EditOff,
  Refresh,
  Save,
} from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Hidden,
  IconButton,
  Switch,
} from "@mui/material";
import { JSONSchema7 } from "json-schema";
import { JsonLdContext } from "jsonld-context-parser";
import { isEmpty } from "lodash";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useFormRefsContext } from "../provider/formRefsContext";
import AdbSpecialDateRenderer, {
  adbSpecialDateControlTester,
} from "../renderer/AdbSpecialDateRenderer";
import AutoIdentifierRenderer from "../renderer/AutoIdentifierRenderer";
import ImageRenderer from "../renderer/ImageRenderer";
import InlineCondensedSemanticFormsRenderer from "../renderer/InlineCondensedSemanticFormsRenderer";
import InlineSemanticFormsRenderer from "../renderer/InlineSemanticFormsRenderer";
import MaterialArrayOfLinkedItemRenderer from "../renderer/MaterialArrayOfLinkedItemRenderer";
import MaterialCustomAnyOfRenderer, {
  materialCustomAnyOfControlTester,
} from "../renderer/MaterialCustomAnyOfRenderer";
import MaterialLinkedObjectRenderer, {
  materialLinkedObjectControlTester,
} from "../renderer/MaterialLinkedObjectRenderer";
import TypeOfRenderer from "../renderer/TypeOfRenderer";
import { useJsonldParser } from "../state/useJsonldParser";
import { useSettings } from "../state/useLocalSettings";
import {
  CRUDOptions,
  SparqlBuildOptions,
  useSPARQL_CRUD,
} from "../state/useSPARQL_CRUD";
import SimilarityFinder from "./SimilarityFinder";
import { FormDebuggingTools } from "./FormDebuggingTools";
import { optionallyCreatePortal } from "../helper";

export type CRUDOpsType = {
  load: () => Promise<void>;
  save: () => Promise<void>;
  remove: () => Promise<void>;
};

interface OwnProps {
  entityIRI?: string | undefined;
  data: any;
  setData: (data: any) => void;
  shouldLoadInitially?: boolean;
  typeIRI: string;
  schema: JSONSchema7;
  jsonldContext: JsonLdContext;
  defaultPrefix: string;
  debugEnabled?: boolean;
  crudOptions?: Partial<CRUDOptions>;
  queryBuildOptions?: SparqlBuildOptions;
  jsonFormsProps?: Partial<JsonFormsInitStateProps>;
  onEntityChange?: (entityIRI: string | undefined) => void;
  onEntityDataChange?: (entityData: any) => void;
  onInit?: (crudOps: CRUDOpsType) => void;
  hideToolbar?: boolean;
  readonly?: boolean;
  forceEditMode?: boolean;
  defaultEditMode?: boolean;
  searchText?: string;
  parentIRI?: string;
  toolbarChildren?: React.ReactNode;
  onLoad?: (data: any) => void;
}

export type SemanticJsonFormsProps = OwnProps;

const renderers = [
  ...materialRenderers,
  {
    tester: materialCustomAnyOfControlTester,
    renderer: MaterialCustomAnyOfRenderer,
  },
  {
    tester: rankWith(10, scopeEndsWith("image")),
    renderer: ImageRenderer,
  },
  {
    tester: rankWith(10, scopeEndsWith("@id")),
    renderer: AutoIdentifierRenderer,
  },
  {
    tester: rankWith(10, scopeEndsWith("@type")),
    renderer: TypeOfRenderer,
  },
  {
    tester: rankWith(5, isObjectArray),
    renderer: MaterialArrayOfLinkedItemRenderer,
  },
  {
    tester: rankWith(13, (uischema: UISchemaElement): boolean => {
      if (isEmpty(uischema)) {
        return false;
      }
      const options = uischema.options;
      return !isEmpty(options) && options["inline"];
    }),
    renderer: InlineSemanticFormsRenderer,
  },
  {
    tester: rankWith(14, (uischema: UISchemaElement, schema, ctx): boolean => {
      if (isEmpty(uischema) || isObjectArrayControl(uischema, schema, ctx)) {
        return false;
      }
      const options = uischema.options;
      return !isEmpty(options) && options["inline"];
    }),
    renderer: InlineCondensedSemanticFormsRenderer,
  },
  {
    tester: adbSpecialDateControlTester,
    renderer: AdbSpecialDateRenderer,
  },
  {
    tester: materialLinkedObjectControlTester,
    renderer: MaterialLinkedObjectRenderer,
  },
];

const SemanticJsonForm: FunctionComponent<SemanticJsonFormsProps> = ({
  entityIRI,
  data,
  setData,
  shouldLoadInitially,
  typeIRI,
  defaultPrefix,
  schema,
  jsonldContext,
  crudOptions = {},
  queryBuildOptions,
  jsonFormsProps = {},
  onEntityDataChange,
  onInit,
  hideToolbar,
  readonly,
  forceEditMode,
  defaultEditMode,
  searchText,
  parentIRI,
  toolbarChildren,
  onLoad,
}) => {
  const [jsonldData, setJsonldData] = useState<any>({});
  //const {formData, setFormData} = useFormEditor()
  const [formData, setFormData] = useState<any | undefined>();
  const [initiallyLoaded, setInitiallyLoaded] = useState<string | undefined>(
    undefined,
  );
  const [managedEditMode, setEditMode] = useState(defaultEditMode || false);
  const editMode = useMemo(
    () =>
      (typeof forceEditMode !== "boolean" && managedEditMode) || forceEditMode,
    [managedEditMode, forceEditMode],
  );
  const [hideSimilarityFinder, setHideSimilarityFinder] = useState(true);
  //const typeName = useMemo(() => typeIRI.substring(BASE_IRI.length, typeIRI.length), [typeIRI])

  useJsonldParser(data, jsonldContext, schema, {
    onJsonldData: setJsonldData,
    onFormDataChange: setFormData,
    defaultPrefix,
    enabled: true,
  });

  const ownIRI = useMemo(
    () => entityIRI || jsonldData["@id"],
    [entityIRI, jsonldData],
  );

  const { exists, load, save, remove, isUpdate, setIsUpdate, ready } =
    useSPARQL_CRUD(
      ownIRI,
      typeIRI,
      schema,
      //@ts-ignore
      {
        ...crudOptions,
        defaultPrefix,
        setData: setData,
        data: jsonldData,
        queryBuildOptions,
        onLoad,
      },
    );
  const { renderers: jfpRenderers, ...jfpProps } = jsonFormsProps;
  const allRenderer = useMemo(
    () => [...renderers, ...(jfpRenderers || [])],
    [jfpRenderers],
  );

  //const { toolbarRef } = useFormRefsContext();

  useEffect(() => {
    if (!ready) return;
    const testExistenceAndLoad = async () => {
      if (!entityIRI || !shouldLoadInitially || initiallyLoaded === entityIRI)
        return;
      setIsUpdate(await exists());
      await load();
      setInitiallyLoaded(entityIRI);
    };
    setTimeout(() => testExistenceAndLoad(), 1);
    //todo why is it necessary
    //testExistenceAndLoad()
  }, [
    entityIRI,
    shouldLoadInitially,
    exists,
    load,
    initiallyLoaded,
    setInitiallyLoaded,
  ]);

  const handleFormChange = useCallback(
    (state: Pick<JsonFormsCore, "data" | "errors">) => {
      setData(state.data);
    },
    [setData, setHideSimilarityFinder],
  );

  useEffect(() => {
    if (searchText && searchText.length > 0) {
      setHideSimilarityFinder(false);
    }
  }, [searchText, setHideSimilarityFinder]);

  const handleNewData = useCallback(
    (newData: any) => {
      console.log("handle new data accepted", newData);
      if (!newData) return;
      setData((data: any) => ({
        "@id": data["@id"],
        "@type": data["@type"],
        ...newData,
      }));
    },
    [setData],
  );

  useEffect(() => {
    if (onInit) {
      onInit({
        load: async () => {
          await load();
        },
        save,
        remove,
      });
    }
  }, [onInit, load, save, remove]);

  const handleSave = useCallback(async () => {
    await save();
    await load();
  }, [entityIRI, save, setEditMode]);

  return (
    <>
      {optionallyCreatePortal(
        <>
          <IconButton onClick={() => setEditMode((editMode) => !editMode)}>
            {editMode ? <EditOff /> : <Edit />}
          </IconButton>
          {editMode && (
            <>
              <IconButton onClick={handleSave} aria-label="save">
                <Save />
              </IconButton>
              <IconButton onClick={remove} aria-lable="remove">
                <Delete />
              </IconButton>
              <IconButton onClick={() => load()} aria-lable="refresh">
                <Refresh />
              </IconButton>
            </>
          )}
          {toolbarChildren}
        </>,
      )}
      <Grid
        container
        spacing={2}
        sx={{ marginTop: "1em", marginBottom: "2em", width: "100%" }}
      >
        <Grid
          item
          xs={12}
          md={hideSimilarityFinder ? undefined : 8}
          lg={hideSimilarityFinder ? undefined : 6}
          flexGrow={1}
        >
          <Card>
            <CardContent>
              <JsonForms
                readonly={!editMode}
                data={data}
                renderers={allRenderer}
                cells={materialCells}
                onChange={handleFormChange}
                schema={schema as JsonSchema}
                {...jfpProps}
              />
            </CardContent>
          </Card>
          <FormDebuggingTools
            jsonData={{
              rawData: data,
              jsonldData: jsonldData,
              formData: formData,
            }}
          />
        </Grid>
        {!hideSimilarityFinder && (
          <>
            <Grid item xs={12} lg={6} md={4}>
              <Card>
                <CardContent>
                  <IconButton
                    onClick={() => setHideSimilarityFinder(true)}
                    sx={{ position: "absolute" }}
                  >
                    <Close />
                  </IconButton>
                  <SimilarityFinder
                    search={searchText}
                    data={data}
                    classIRI={typeIRI}
                    jsonSchema={schema}
                    onEntityIRIChange={(iri) =>
                      onEntityDataChange &&
                      onEntityDataChange({ "@id": iri, "@type": typeIRI })
                    }
                    searchOnDataPath={"title"}
                    onMappedDataAccepted={handleNewData}
                  />
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
};

export default SemanticJsonForm;
