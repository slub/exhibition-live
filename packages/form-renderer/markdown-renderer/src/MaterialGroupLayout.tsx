import {
  getSchema,
  getTranslator,
  GroupLayout,
  JsonFormsState,
  LayoutProps,
  Resolve,
} from "@jsonforms/core";
import {
  MaterialLayoutRenderer,
  MaterialLayoutRendererProps,
} from "@jsonforms/material-renderers";
import { useJsonForms, withJsonFormsLayoutProps } from "@jsonforms/react";
import {
  Card,
  CardContent,
  CardHeader,
  FormHelperText,
  Grid,
  Hidden,
} from "@mui/material";
import isEmpty from "lodash/isEmpty";
import React, { useMemo } from "react";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSanitize from "rehype-sanitize";

import { getI18nDescription, getI18nLabel } from "./i18nHelper";
import { MDEditorMarkdown } from "@slub/edb-markdown-renderer";

const style: { [x: string]: any } = { marginBottom: "10px" };

const GroupComponent = ({
  visible,
  enabled,
  uischema,
  state,
  path,
  schema,
  ...props
}: MaterialLayoutRendererProps & { state: JsonFormsState }) => {
  const groupLayout = uischema as GroupLayout;
  const rootSchema = getSchema(state);
  const translator = getTranslator()(state);
  const resolvedSchema = Resolve.schema(
    schema || rootSchema,
    `#/properties/${groupLayout.label}`,
    rootSchema,
  );
  const i18nLabel =
    path &&
    getI18nLabel(
      groupLayout.label || null,
      translator,
      groupLayout,
      `${path}.${groupLayout.label}`,
      resolvedSchema,
    );
  const i18nDescription =
    path &&
    getI18nDescription(
      null,
      translator,
      groupLayout,
      `${path}.${groupLayout.label}`,
      resolvedSchema,
    );
  const rehypePlugins = useMemo<any>(
    () => [[rehypeSanitize], [rehypeExternalLinks, { target: "_blank" }]],
    [],
  );
  return (
    <Hidden xsUp={!visible}>
      <Card style={style}>
        {!isEmpty(i18nLabel) && <CardHeader title={i18nLabel} />}
        <CardContent>
          {i18nDescription && i18nDescription.length > 0 && (
            <Hidden xsUp={!visible}>
              <Grid item xs>
                <FormHelperText>
                  <MDEditorMarkdown
                    source={i18nDescription}
                    rehypePlugins={rehypePlugins}
                  />
                </FormHelperText>
              </Grid>
            </Hidden>
          )}
          <MaterialLayoutRenderer
            {...props}
            path={path}
            schema={schema}
            visible={visible}
            enabled={enabled}
            elements={groupLayout.elements}
          />
        </CardContent>
      </Card>
    </Hidden>
  );
};

const MaterializedGroupLayoutRendererComponent = ({
  uischema,
  schema,
  path,
  visible,
  enabled,
  renderers,
  cells,
  direction,
}: LayoutProps) => {
  const groupLayout = uischema as GroupLayout;
  const ctx = useJsonForms();
  const state = { jsonforms: ctx };
  return (
    <GroupComponent
      elements={groupLayout.elements}
      schema={schema}
      path={path}
      direction={direction}
      visible={visible}
      enabled={enabled}
      uischema={uischema}
      renderers={renderers}
      cells={cells}
      state={state}
    />
  );
};

export const MaterializedGroupLayoutRenderer = withJsonFormsLayoutProps(
  MaterializedGroupLayoutRendererComponent,
);
