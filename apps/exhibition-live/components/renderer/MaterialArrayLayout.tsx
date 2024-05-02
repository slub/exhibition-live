/*
  The MIT License

  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import {
  ArrayLayoutProps,
  composePaths,
  computeLabel,
  createDefaultValue,
  JsonSchema,
  JsonSchema7,
  Resolve,
} from "@jsonforms/core";
import merge from "lodash/merge";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ArrayLayoutToolbar } from "./ArrayToolbar";
import { useJsonForms } from "@jsonforms/react";
import { memo } from "./config";
import { uniqBy, orderBy } from "lodash";
import { SimpleExpandPanelRenderer } from "./SimpleExpandPanelRenderer";
import { SemanticFormsModal } from "./SemanticFormsModal";
import { BASE_IRI, primaryFieldExtracts } from "../config";
import { irisToData, makeFormsPath, validate } from "@slub/edb-ui-utils";
import { JSONSchema7 } from "json-schema";
import { createNewIRI, slent } from "../form/formConfigs";
import { v4 as uuidv4 } from "uuid";
import { Grid, IconButton, List, Paper } from "@mui/material";
import { SemanticFormsInline } from "./SemanticFormsInline";
import CheckIcon from "@mui/icons-material/Check";
import {
  useCRUDWithQueryClient,
  useFormDataStore,
} from "@slub/edb-state-hooks";
import { useSnackbar } from "notistack";
import { ErrorObject } from "ajv";
import { applyToEachField, extractFieldIfString } from "@slub/edb-ui-utils";
import { JSONSchema } from "json-schema-to-ts";
import { useTranslation } from "next-i18next";
import { Pulse } from "../form/utils";
import { bringDefinitionToTop } from "@slub/json-schema-utils";

const uiSchemaOptionsSchema = {
  type: "object",
  properties: {
    labelAsHeadline: {
      type: "boolean",
    },
    hideRequiredAsterisk: {
      type: "boolean",
    },
    isReifiedStatement: {
      type: "boolean",
    },
    orderBy: {
      type: "string",
    },
    autoFocusOnValid: {
      type: "boolean",
    },
    additionalKnowledgeSources: {
      type: "array",
      items: {
        type: "string",
      },
    },
    elementDetailItemPath: {
      type: "string",
    },
    elementLabelTemplate: {
      type: "string",
    },
    elementLabelProp: {
      type: "string",
    },
    imagePath: {
      type: "string",
    },
  },
} as const satisfies JSONSchema;

const MaterialArrayLayoutComponent = (props: ArrayLayoutProps) => {
  const innerCreateDefaultValue = useCallback(
    () => createDefaultValue(props.schema),
    [props.schema],
  );
  const {
    data,
    path,
    schema,
    errors,
    addItem,
    label,
    required,
    rootSchema,
    config,
    removeItems,
    uischema,
  } = props;
  const { readonly, core } = useJsonForms();
  const realData = Resolve.data(core.data, path);
  const typeIRI = schema.properties?.["@type"]?.const;
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const { t } = useTranslation();

  const [entityIRI, setEntityIRI] = useState(createNewIRI());
  const { formData, setFormData } = useFormDataStore({
    entityIRI,
    typeIRI,
    createNewEntityIRI: createNewIRI,
    autoCreateNewEntityIRI: true,
  });

  const addButtonRef = useRef<HTMLButtonElement>(null);

  const handleInlineFormDataChange = useCallback(
    (data: any) => {
      setFormData(data);
    },
    [setFormData],
  );

  const handleCreateNew = useCallback(() => {
    setFormData(irisToData(slent(uuidv4()).value, typeIRI));
    setModalIsOpen(true);
  }, [setModalIsOpen, setFormData, typeIRI]);
  const typeName = useMemo(
    () => typeIRI && typeIRI.substring(BASE_IRI.length, typeIRI.length),
    [typeIRI],
  );
  const subSchema = useMemo(
    () =>
      bringDefinitionToTop(rootSchema as JSONSchema7, typeName) as JsonSchema,
    [rootSchema, typeName],
  );
  const { saveMutation } = useCRUDWithQueryClient({
    entityIRI,
    typeIRI,
    schema: subSchema as JSONSchema7,
    queryOptions: { enabled: false },
  });

  const { enqueueSnackbar } = useSnackbar();
  const handleSaveAndAdd = useCallback(() => {
    const finalData = {
      ...formData,
    };
    saveMutation
      .mutateAsync(finalData)
      .then((res) => {
        enqueueSnackbar(t("successfully saved"), { variant: "success" });
        addItem(path, res)();
        setEntityIRI(createNewIRI());
      })
      .catch((e) => {
        enqueueSnackbar(t("error while saving") + e.message, {
          variant: "error",
        });
      });
  }, [saveMutation, typeIRI, addItem, setFormData]);

  const handleAddNew = useCallback(() => {
    setModalIsOpen(false);
    //if(typeof saveMethod === 'function')  saveMethod();
    addItem(path, formData)();
    setFormData({});
  }, [setModalIsOpen, addItem, formData, setFormData, typeIRI]);

  const {
    isReifiedStatement,
    orderBy: orderByPropertyPath,
    autoFocusOnValid,
    additionalKnowledgeSources,
    elementDetailItemPath,
    elementLabelTemplate,
    elementLabelProp = "label",
    imagePath,
    labelAsHeadline,
    hideRequiredAsterisk,
  } = useMemo(() => {
    const appliedUiSchemaOptions = merge({}, config, uischema.options);
    if (validate(uiSchemaOptionsSchema, appliedUiSchemaOptions)) {
      return appliedUiSchemaOptions;
    }
    return {};
  }, [config, uischema.options]);

  const [inlineErrors, setInlineErrors] = useState<ErrorObject[] | null>(null);
  const handleErrors = useCallback(
    (err: ErrorObject[]) => {
      setInlineErrors(err);
    },
    [setInlineErrors],
  );

  useEffect(() => {
    if (
      inlineErrors?.length === 0 &&
      addButtonRef.current &&
      autoFocusOnValid
    ) {
      addButtonRef.current.focus();
    }
  }, [inlineErrors, autoFocusOnValid]);

  const formsPath = useMemo(
    () => makeFormsPath(config?.formsPath, path),
    [config?.formsPath, path],
  );

  useEffect(() => {
    setFormData(irisToData(slent(uuidv4()).value, typeIRI));
  }, [formsPath, typeIRI, setFormData]);

  const orderedAndUniqueData = useMemo(() => {
    return orderBy(
      uniqBy(
        realData?.map((childData, index) => {
          const typeName = typeIRI.substring(BASE_IRI.length, typeIRI.length);
          const fieldDecl = primaryFieldExtracts[typeName];
          let label = childData.label || childData.__label || childData["@id"];
          if (childData && fieldDecl) {
            const extractedInfo = applyToEachField(
              childData,
              fieldDecl,
              extractFieldIfString,
            );
            if (extractedInfo.label) {
              label = extractedInfo.label;
            }
          }
          return {
            id: childData["@id"],
            childData,
            index,
            label,
          };
        }),
        "id",
      ),
      ["label", "asc"],
    );
  }, [realData, orderByPropertyPath, typeIRI]);

  return (
    <div>
      <ArrayLayoutToolbar
        labelAsHeadline={labelAsHeadline}
        label={computeLabel(
          label,
          Boolean(required),
          Boolean(hideRequiredAsterisk),
        )}
        errors={errors}
        path={path}
        schema={schema as JsonSchema7 | undefined}
        addItem={addItem}
        onCreate={handleCreateNew}
        createDefault={innerCreateDefaultValue}
        readonly={readonly}
        isReifiedStatement={isReifiedStatement}
        formsPath={makeFormsPath(config?.formsPath, path)}
        additionalKnowledgeSources={additionalKnowledgeSources}
      />
      {modalIsOpen && (
        <SemanticFormsModal
          schema={subSchema}
          entityIRI={formData["@id"]}
          formData={formData}
          typeIRI={typeIRI}
          label={label}
          open={modalIsOpen}
          askClose={handleAddNew}
          askCancel={() => setModalIsOpen(false)}
          onChange={(entityIRI) =>
            entityIRI && setFormData({ "@id": entityIRI })
          }
          onFormDataChange={(data) => setFormData(data)}
          formsPath={makeFormsPath(config?.formsPath, path)}
        />
      )}
      {isReifiedStatement && (
        <Paper elevation={1} sx={{ p: 2, marginTop: 2, marginBottom: 1 }}>
          <Grid
            display={"flex"}
            container
            direction={"row"}
            alignItems={"center"}
          >
            <Grid item flex={"1"}>
              <SemanticFormsInline
                schema={subSchema}
                entityIRI={formData["@id"]}
                typeIRI={typeIRI}
                onError={handleErrors}
                formData={formData}
                onFormDataChange={handleInlineFormDataChange}
                semanticJsonFormsProps={{
                  disableSimilarityFinder: true,
                }}
                formsPath={formsPath}
              />
            </Grid>
            <Grid item>
              <IconButton
                disabled={inlineErrors?.length > 0}
                onClick={handleSaveAndAdd}
                ref={addButtonRef}
              >
                <Pulse pulse={inlineErrors?.length === 0}>
                  <CheckIcon style={{ fontSize: 40 }} />
                </Pulse>
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      )}
      <List dense>
        {data > 0
          ? orderedAndUniqueData.map(
              ({ id: expandID, childData, index }: any, count) => {
                const childPath = composePaths(path, `${index}`);
                return (
                  <SimpleExpandPanelRenderer
                    onRemove={removeItems(path, [index])}
                    schema={schema}
                    onChange={() => {}}
                    rootSchema={rootSchema}
                    entityIRI={expandID}
                    data={childData}
                    key={expandID}
                    index={index}
                    count={count}
                    path={childPath}
                    imagePath={imagePath}
                    elementDetailItemPath={elementDetailItemPath}
                    childLabelTemplate={elementLabelTemplate}
                    elementLabelProp={elementLabelProp}
                    formsPath={formsPath}
                  />
                );
              },
            )
          : null}
      </List>
    </div>
  );
};

export const MaterialArrayLayout = memo(MaterialArrayLayoutComponent);
