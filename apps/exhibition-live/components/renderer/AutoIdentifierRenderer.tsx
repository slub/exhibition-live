import { ControlProps, showAsRequired } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { Edit, EditOff, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  FormControl,
  FormLabel,
  Grid,
  Hidden,
  IconButton,
} from "@mui/material";
import merge from "lodash/merge";
import React, { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSettings } from "../state/useLocalSettings";
import { slent } from "../form/formConfigs";

const AutoIdentifierRenderer = (props: ControlProps) => {
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
    if (!data && schema.title) {
      const prefix = slent[""].value;
      const newURI = `${prefix}${uuidv4()}`;
      handleChange_(newURI);
    }
  }, [schema, data, handleChange_]);

  const {
    features: { enableDebug },
  } = useSettings();

  return (
    <Hidden xsUp={!enableDebug}>
      <FormControl
        fullWidth={!appliedUiSchemaOptions.trim}
        id={id}
        variant={"standard"}
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

export default withJsonFormsControlProps(AutoIdentifierRenderer);
