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
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { ArrayLayoutToolbar } from "./ArrayToolbar";
import { useJsonForms } from "@jsonforms/react";
import { memo } from "./config";
import { uniqBy, orderBy } from "lodash";
import { SemanticFormsModal } from "./SemanticFormsModal";
import { BASE_IRI } from "../config";
import { irisToData, makeFormsPath } from "../utils/core";
import { JSONSchema7 } from "json-schema";
import { defaultJsonldContext, slent } from "../form/formConfigs";
import { v4 as uuidv4 } from "uuid";
import { Box, Grid, IconButton, List, Stack } from "@mui/material";
import { SemanticFormsInline } from "./SemanticFormsInline";
import AddIcon from "@mui/icons-material/Add";
import { useGlobalCRUDOptions } from "../state/useGlobalCRUDOptions";
import { useCRUDWithQueryClient } from "../state/useCRUDWithQueryClient";
import { useSnackbar } from "notistack";
import { SimpleChipRenderer } from "./SimpleChipRenderer";
import { bringDefinitionToTop } from "@slub/json-schema-utils";

type OwnProps = {
  removeItems(path: string, toDelete: number[]): () => void;
};
const MaterialArrayChipsLayoutComponent = (props: ArrayLayoutProps & {}) => {
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
  } = props;
  const appliedUiSchemaOptions = merge({}, config, props.uischema.options);
  const { readonly, core } = useJsonForms();
  const realData = Resolve.data(core.data, path);
  const typeIRI = schema.properties?.["@type"]?.const;
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState<any>(
    irisToData(slent(uuidv4()).value, typeIRI),
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
  const { crudOptions } = useGlobalCRUDOptions();
  const entityIRI = useMemo(() => formData["@id"], [formData]);
  const { saveMutation } = useCRUDWithQueryClient(
    entityIRI,
    typeIRI,
    subSchema as JSONSchema7,
    { enabled: false },
  );

  const { enqueueSnackbar } = useSnackbar();
  const handleSaveAndAdd = useCallback(() => {
    const finalData = {
      ...formData,
    };
    //if(typeof saveMethod === 'function')  saveMethod();
    saveMutation
      .mutateAsync(finalData)
      .then((res) => {
        enqueueSnackbar("Saved", { variant: "success" });
        addItem(path, res)();
        const id = slent(uuidv4()).value;
        setFormData({
          "@id": id,
          "@type": typeIRI,
        });
      })
      .catch((e) => {
        enqueueSnackbar("Error while saving " + e.message, {
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

  const isReifiedStatement = Boolean(appliedUiSchemaOptions.isReifiedStatement);

  const formsPath = useMemo(
    () => makeFormsPath(config?.formsPath, path),
    [config?.formsPath, path],
  );

  useEffect(() => {
    setFormData(irisToData(slent(uuidv4()).value, typeIRI));
  }, [formsPath, typeIRI, setFormData]);

  return (
    <Box
      sx={(theme) => ({
        marginBottom: theme.spacing(2),
      })}
    >
      <ArrayLayoutToolbar
        label={computeLabel(
          label,
          Boolean(required),
          appliedUiSchemaOptions.hideRequiredAsterisk,
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
          formsPath={formsPath}
        />
      )}
      {isReifiedStatement && (
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
              formData={formData}
              onFormDataChange={(data) => setFormData(data)}
              semanticJsonFormsProps={{
                disableSimilarityFinder: true,
              }}
              formsPath={makeFormsPath(config?.formsPath, path)}
            />
          </Grid>
          <Grid item>
            <IconButton onClick={handleSaveAndAdd}>
              <AddIcon style={{ fontSize: 40 }} />
            </IconButton>
          </Grid>
        </Grid>
      )}
      <Stack spacing={1} direction="row" flexWrap={"wrap"}>
        {data > 0
          ? orderBy(
              uniqBy(
                realData?.map((childData, index) => ({
                  id: childData["@id"],
                  childData,
                  index,
                })),
                "id",
              ),
              "id",
            ).map(({ id: expandID, childData, index }: any, count) => {
              const childPath = composePaths(path, `${index}`);
              return (
                <Box key={expandID}>
                  <SimpleChipRenderer
                    onRemove={removeItems(path, [index])}
                    schema={schema}
                    onChange={() => {}}
                    rootSchema={rootSchema}
                    entityIRI={expandID}
                    data={childData}
                    index={index}
                    count={count}
                    path={childPath}
                    childLabelTemplate={
                      appliedUiSchemaOptions.elementLabelTemplate
                    }
                    elementLabelProp={
                      appliedUiSchemaOptions.elementLabelProp || "label"
                    }
                    formsPath={makeFormsPath(config?.formsPath, childPath)}
                    sx={{
                      margin: 0.5,
                    }}
                  />
                </Box>
              );
            })
          : null}
      </Stack>
    </Box>
  );
};

export const MaterialArrayChipsLayout = memo(MaterialArrayChipsLayoutComponent);
