import { ControlProps, showAsRequired } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  FormControl,
  FormLabel,
  Grid,
  Hidden,
  IconButton,
} from "@mui/material";
import merge from "lodash/merge";
import React, { useCallback, useState } from "react";
import { useSettings } from "@slub/edb-state-hooks";

const AutoIdentifierRendererComponent = (props: ControlProps) => {
  const {
    id,
    errors,
    schema,
    uischema,
    visible,
    required,
    config,
    data,
    handleChange,
    path,
  } = props;
  const isValid = errors.length === 0;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const [editMode, setEditMode] = useState(false);

  const handleChange_ = useCallback(
    (v?: string) => {
      handleChange(path, v);
    },
    [path, handleChange],
  );

  const {
    features: { enableDebug },
  } = useSettings();

  return (
    <Hidden xsUp={!enableDebug}>
      <FormControl
        fullWidth={!appliedUiSchemaOptions.trim}
        id={id}
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
      >
        <Grid container alignItems="baseline">
          <Grid item>
            <IconButton onClick={() => setEditMode((prev) => !prev)}>
              {editMode ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </Grid>
          {editMode && (
            <Grid item>
              <FormLabel
                error={!isValid}
                required={showAsRequired(
                  !!required,
                  appliedUiSchemaOptions.hideRequiredAsterisk,
                )}
              >
                {data || ""}
              </FormLabel>
            </Grid>
          )}
        </Grid>
      </FormControl>
    </Hidden>
  );
};

export const AutoIdentifierRenderer = withJsonFormsControlProps(
  AutoIdentifierRendererComponent,
);
