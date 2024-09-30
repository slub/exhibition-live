import { ControlProps } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { ImageNotSupported, Image as ImageIcon } from "@mui/icons-material";
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
import { useTranslation } from "next-i18next";

const ImageRendererComponent = (props: ControlProps) => {
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
  const { t } = useTranslation();
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
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
      >
        <Grid container direction={"column"} alignItems="center">
          {
            <Grid item>
              <IconButton onClick={() => setEditMode((prev) => !prev)}>
                {editMode ? <ImageNotSupported /> : <ImageIcon />}
              </IconButton>
            </Grid>
          }
          {editMode && (
            <Grid item>
              <TextField
                label={schema.title || t("image url")}
                onChange={(e) => handleChange_(e.target.value)}
                value={data}
                fullWidth={true}
              />
            </Grid>
          )}
          {data && (
            <Grid item>
              <Image
                src={data}
                alt={data}
                style={{ maxWidth: "200px", width: "100%" }}
              />
            </Grid>
          )}
        </Grid>
      </FormControl>
    </Hidden>
  );
};

export const ImageRenderer = withJsonFormsControlProps(ImageRendererComponent);
