import AddIcon from "@mui/icons-material/Add";
import {
  Grid,
  Hidden,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";

import ValidationIcon from "./ValidationIcon";
import DiscoverAutocompleteInput from "../form/discover/DiscoverAutocompleteInput";
import { useMemo } from "react";
import { JsonSchema7 } from "@jsonforms/core";
import { sladb, slent } from "../form/formConfigs";
import { BASE_IRI } from "../config";
import { memo } from "./config";

export interface ArrayLayoutToolbarProps {
  label: string;
  errors: string;
  path: string;
  addItem(path: string, data: any): () => void;
  createDefault(): any;
  readonly?: boolean;
  typeIRI?: string;
  onCreate?: () => void;
  isReifiedStatement?: boolean;
}

export const getDefaultKey = (typeIRI?: string) => {
  if (!typeIRI) return "title";
  if (typeIRI === sladb.ExhibitionWebLink.value) return "weblink";
  return "title";
};
export const ArrayLayoutToolbar = memo(
  ({
    label,
    errors,
    addItem,
    path,
    schema,
    createDefault,
    readonly,
    onCreate,
    isReifiedStatement,
  }: ArrayLayoutToolbarProps & { schema?: JsonSchema7 }) => {
    const { t } = useTranslation();
    const typeIRI = useMemo(
      () => schema?.properties?.["@type"]?.const,
      [schema],
    );
    const handleChange_ = React.useCallback(
      (value: any, label: string) => {
        addItem(path, {
          "@id": value,
          __label: label,
        })();
      },
      [addItem, path],
    );
    const handleCreateNewFromSearch = React.useCallback(
      (value?: string) => {
        if (!value) return;
        addItem(path, {
          "@id": slent(uuidv4()).value,
          "@type": typeIRI,
          __draft: true,
          [getDefaultKey(typeIRI)]: value,
        })();
      },
      [addItem, path, typeIRI],
    );
    const typeName = useMemo(
      () => typeIRI.substring(BASE_IRI.length, typeIRI.length),
      [typeIRI],
    );
    return (
      <Toolbar disableGutters={true} sx={{ padding: 0 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant={"h4"}>{label}</Typography>
          </Grid>
          <Hidden xsUp={errors.length === 0}>
            <Grid item>
              <ValidationIcon id="tooltip-validation" errorMessages={errors} />
            </Grid>
          </Hidden>
          {!isReifiedStatement && (
            <Grid item>
              <Grid
                container
                sx={{ visibility: readonly ? "hidden" : "visible" }}
              >
                <Grid item flex={1} sx={{ minWidth: "25em" }}>
                  <DiscoverAutocompleteInput
                    typeIRI={typeIRI}
                    typeName={typeName}
                    title={label || ""}
                    onEnterSearch={handleCreateNewFromSearch}
                    onSelectionChange={(selection) =>
                      handleChange_(selection?.value, selection?.label)
                    }
                  />
                </Grid>
                <Grid item>
                  <Tooltip
                    id="tooltip-add"
                    title={t("add_another", { item: label }) || ""}
                    placement="bottom"
                  >
                    <IconButton
                      aria-label={t("add_another", { item: label })}
                      onClick={onCreate}
                      size="large"
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Toolbar>
    );
  },
);
