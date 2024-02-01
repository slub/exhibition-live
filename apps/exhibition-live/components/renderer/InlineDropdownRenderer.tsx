import {
  ControlProps,
  JsonSchema,
  Resolve,
  resolveSchema,
} from "@jsonforms/core";
import { useJsonForms, withJsonFormsControlProps } from "@jsonforms/react";
import { FormControl, Grid, Hidden, IconButton } from "@mui/material";
import merge from "lodash/merge";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { slent } from "../form/formConfigs";
import {
  Add,
  Edit,
  EditOff,
  OpenInNew,
  OpenInNewOff,
} from "@mui/icons-material";
import { primaryFields, typeIRItoTypeName } from "../config";
import { AutocompleteSuggestion } from "../form/DebouncedAutoComplete";
import { SemanticFormsModal } from "./SemanticFormsModal";
import { extractFieldIfString } from "../utils/mapping/simpleFieldExtractor";
import { PrimaryField } from "../utils/types";
import { encodeIRI, makeFormsPath } from "../utils/core";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { PreloadedOptionSelect } from "../form/PreloadedOptionSelect";
import { findEntityByClass } from "../utils/discover";
import { useGlobalCRUDOptions } from "../state/useGlobalCRUDOptions";

const InlineDropdownRenderer = (props: ControlProps) => {
  const {
    id,
    errors,
    schema,
    uischema,
    visible,
    required,
    renderers,
    config,
    data,
    handleChange,
    path,
    rootSchema,
    label,
    description,
  } = props;
  const [formData, setFormData] = useState<any>({ "@id": data });
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const ctx = useJsonForms();
  const [realLabel, setRealLabel] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const formsPath = useMemo(
    () => makeFormsPath(config?.formsPath, path),
    [config?.formsPath, path],
  );
  const selected = useMemo(
    () =>
      data
        ? { value: data || null, label: realLabel }
        : { value: null, label: null },
    [data, realLabel],
  );
  const { $ref, typeIRI } = appliedUiSchemaOptions.context || {};
  const subSchema = useMemo(() => {
    if (!$ref) return;
    const schema2 = {
      ...schema,
      $ref,
    };
    const resolvedSchema = resolveSchema(
      schema2 as JsonSchema,
      "",
      rootSchema as JsonSchema,
    );
    return {
      ...rootSchema,
      ...resolvedSchema,
    };
  }, [$ref, schema, rootSchema]);

  useEffect(() => {
    if (!data) setRealLabel("");
  }, [data, setRealLabel]);

  const handleSelectedChange = useCallback(
    (v: AutocompleteSuggestion) => {
      if (!v) {
        handleChange(path, undefined);
        return;
      }
      if (v.value !== data) handleChange(path, v.value);
      setFormData({ "@id": v.value });
      setRealLabel(v.label);
    },
    [path, handleChange, data, setRealLabel, setFormData],
  );

  const handleOptionChange = useCallback(
    (e: React.SyntheticEvent, v: AutocompleteSuggestion | null) => {
      e.stopPropagation();
      e.preventDefault();
      handleSelectedChange(v);
    },
    [handleSelectedChange],
  );

  useEffect(() => {
    setRealLabel((_old) => {
      if ((_old && _old.length > 0) || !data) return _old;
      const parentData = Resolve.data(
        ctx?.core?.data,
        path.substring(0, path.length - ("@id".length + 1)),
      );
      const fieldDecl = primaryFields[typeName] as PrimaryField | undefined;
      let label = "";
      if (fieldDecl?.label)
        label = extractFieldIfString(parentData, fieldDecl.label);
      if (typeof label === "object") {
        return "";
      }
      return label;
    });
  }, [data, ctx?.core?.data, path, setRealLabel]);

  const typeName = useMemo(
    () => typeIRI && typeIRItoTypeName(typeIRI),
    [typeIRI],
  );

  const router = useRouter();
  const locale = router.query.locale || "";
  const handleToggle = useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation();
      //open new tab if middle mouse click
      if (event?.button === 1) {
        window.open(
          `/${locale}/create/${typeName}?encID=${encodeIRI(data)}`,
          "_blank",
        );
        return;
      }
      setModalIsOpen(!modalIsOpen);
    },
    [setModalIsOpen, modalIsOpen, locale, typeName],
  );

  const handleSaveAndClose = useCallback(() => {
    setModalIsOpen(false);
    const id = formData["@id"];
    if (!id) return;
    const fieldDecl = primaryFields[typeName] as PrimaryField | undefined;
    let label = id;
    if (fieldDecl?.label)
      label = extractFieldIfString(formData, fieldDecl.label);
    handleSelectedChange({
      value: id,
      label: typeof label === "string" ? label : id,
    });
  }, [setModalIsOpen, formData, handleSelectedChange]);

  const handleClose = useCallback(() => {
    setModalIsOpen(false);
  }, [setModalIsOpen]);

  const handleFormDataChange = useCallback(
    (data: any) => {
      setFormData(data);
    },
    [setFormData],
  );

  const limit = useMemo(() => {
    return appliedUiSchemaOptions.limit || 100;
  }, [appliedUiSchemaOptions.limit]);

  const newURI = useCallback(() => {
    const prefix = schema.title || slent[""].value;
    const iri = `${prefix}${uuidv4()}`;
    const fieldDecl = primaryFields[typeName] as PrimaryField | undefined;
    const labelKey = fieldDecl?.label || "title";
    setFormData({ "@id": iri });
    return iri;
  }, [schema, data, setFormData]);

  const handleAddNew = useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation();
      newURI();
      setModalIsOpen(true);
    },
    [setModalIsOpen, newURI],
  );

  const { t } = useTranslation();

  const handleAddNewWithinNewTab = useCallback(
    (event: React.MouseEvent) => {
      if (event.button !== 1) return;
      event?.stopPropagation();
      const newIRI = newURI();
      handleSelectedChange({
        value: newIRI,
        label: `${t(typeName)} neu (${newIRI.substring(
          newIRI.lastIndexOf("/") + 1,
          newIRI.length,
        )})`,
      });
      window.open(
        `/${locale}/create/${typeName}?encID=${encodeIRI(newIRI)}`,
        "_blank",
      );
    },
    [setModalIsOpen, newURI, typeName, locale],
  );

  const { crudOptions } = useGlobalCRUDOptions();
  const load = useCallback(
    async (searchString?: string) =>
      typeIRI && crudOptions
        ? (
            await findEntityByClass(
              searchString || null,
              typeIRI,
              crudOptions.selectFetch,
              limit,
            )
          ).map(({ name = "", value }: { name: string; value: any }) => {
            return {
              label: name,
              value,
            };
          })
        : [],
    [typeIRI, crudOptions, limit],
  );

  return (
    <Hidden xsUp={!visible}>
      <Grid container alignItems="baseline">
        <Grid
          sx={{
            transition: "all 0.3s ease-in-out",
          }}
          item
          flex={"auto"}
        >
          <FormControl
            fullWidth={!appliedUiSchemaOptions.trim}
            id={id}
            variant={"standard"}
            sx={(theme) => ({ marginBottom: theme.spacing(2) })}
          >
            <PreloadedOptionSelect
              title={label}
              readOnly={Boolean(ctx.readonly)}
              // @ts-ignore
              load={load}
              typeIRI={typeIRI}
              value={selected}
              onChange={handleOptionChange}
            />
          </FormControl>
        </Grid>
        {!ctx.readonly && (
          <Grid item>
            <Grid container direction="column" spacing={0}>
              {typeof data == "string" && data.length > 0 && (
                <Grid item>
                  <IconButton
                    sx={{ padding: 0 }}
                    onClick={handleToggle}
                    onAuxClick={handleToggle}
                  >
                    {modalIsOpen ? <EditOff /> : <Edit />}
                  </IconButton>
                </Grid>
              )}
              <Grid item>
                <IconButton
                  sx={{ padding: 0 }}
                  onClick={handleAddNew}
                  onAuxClick={handleAddNewWithinNewTab}
                >
                  {<Add />}
                </IconButton>
              </Grid>
            </Grid>
            {
              <SemanticFormsModal
                key={selected.value}
                schema={subSchema as JsonSchema}
                formData={formData}
                entityIRI={formData["@id"]}
                typeIRI={typeIRI}
                label={label}
                open={modalIsOpen}
                askClose={handleSaveAndClose}
                askCancel={handleClose}
                onFormDataChange={handleFormDataChange}
                formsPath={formsPath}
              />
            }
          </Grid>
        )}
      </Grid>
    </Hidden>
  );
};

export default withJsonFormsControlProps(InlineDropdownRenderer);
