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
import merge from "lodash/merge";
import React, { useCallback, useMemo, useState } from "react";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSanitize from "rehype-sanitize";

import MDEditor, { MDEditorMarkdown } from "./MDEditor";

const MarkdownTextFieldRenderer = (props: ControlProps) => {
  const {
    id,
    errors,
    label,
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
      handleChange(path, v || "");
    },
    [path, handleChange],
  );
  const rehypePlugins = useMemo(
    () => [[rehypeSanitize], [rehypeExternalLinks, { target: "_blank" }]],
    [],
  );

  return (
    <Hidden xsUp={!visible}>
      <FormControl
        fullWidth={!appliedUiSchemaOptions.trim}
        id={id}
        variant={"standard"}
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
      >
        <Grid container alignItems="baseline">
          <Grid item>
            <FormLabel
              error={!isValid}
              required={showAsRequired(
                !!required,
                appliedUiSchemaOptions.hideRequiredAsterisk,
              )}
            >
              {label}
            </FormLabel>
          </Grid>
          <Grid item>
            <IconButton onClick={() => setEditMode((prev) => !prev)}>
              {editMode ? <EditOff /> : <Edit />}
            </IconButton>
          </Grid>
        </Grid>
        {editMode ? (
          <MDEditor
            textareaProps={{
              id: id + "-input",
            }}
            value={data as string}
            onChange={handleChange_}
            previewOptions={{
              rehypePlugins: rehypePlugins as any,
            }}
            commandsFilter={(cmd) =>
              cmd?.name && /(divider|code|image|checked)/.test(cmd.name)
                ? false
                : cmd
            }
          />
        ) : (
          <MDEditorMarkdown
            source={data as string}
            rehypePlugins={rehypePlugins as any}
          />
        )}
      </FormControl>
    </Hidden>
  );
};

export default withJsonFormsControlProps(MarkdownTextFieldRenderer);
