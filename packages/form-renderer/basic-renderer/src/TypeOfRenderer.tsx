import { ControlProps, showAsRequired } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { Edit, EditOff } from "@mui/icons-material";
import {
  FormControl,
  FormLabel,
  Grid,
  Hidden,
  IconButton,
} from "@mui/material";
import merge from "lodash-es/merge";
import React, { useCallback, useEffect, useState } from "react";

const TypeOfRendererComponent = (props: ControlProps) => {
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

  useEffect(() => {
    if (!data && schema.const) {
      const newURI = schema.const;
      handleChange_(newURI);
    }
  }, [schema, data, handleChange_]);

  return (
    <Hidden xsUp={true}>
      <FormControl
        fullWidth={!appliedUiSchemaOptions.trim}
        id={id}
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
      >
        <Grid container alignItems="baseline">
          <Grid item>
            <IconButton onClick={() => setEditMode((prev) => !prev)}>
              {editMode ? <EditOff /> : <Edit />}
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

export const TypeOfRenderer = withJsonFormsControlProps(
  TypeOfRendererComponent,
);
