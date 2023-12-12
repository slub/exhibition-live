import { ControlProps } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  FormControl,
  Grid,
  Hidden,
  IconButton,
  TextField,
} from "@mui/material";
import { Image } from "mui-image";
import merge from "lodash/merge";
import React, { useCallback, useState } from "react";

const ImageRenderer = (props: ControlProps) => {
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

  return (
    <Hidden xsUp={false}>
      <FormControl
        fullWidth={!appliedUiSchemaOptions.trim}
        id={id}
        variant={"standard"}
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
      >
        <Grid container direction={"column"} alignItems="baseline">
          {<Grid item>
            <IconButton onClick={() => setEditMode(prev => !prev)}>{editMode ? <VisibilityOff/> : <Visibility/>}</IconButton>
            {editMode && <TextField variant={'standard'} onChange={e => handleChange_(e.target.value)} value={data} fullWidth={true} /> }
          </Grid>}
          {data && (
            <Grid item>
              <Image src={data} alt={data} style={{ width: "100%" }} />
            </Grid>
          )}
        </Grid>
      </FormControl>
    </Hidden>
  );
};

export default withJsonFormsControlProps(ImageRenderer);
