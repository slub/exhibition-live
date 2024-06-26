import { ArrayLayoutProps } from "@jsonforms/core";
import { withJsonFormsArrayLayoutProps } from "@jsonforms/react";
import { Hidden } from "@mui/material";
import React, { useCallback } from "react";

import { MaterialArrayLayout } from "./MaterialArrayLayout";

const MaterialArrayOfLinkedItemRendererComponent = ({
  visible,
  enabled,
  id,
  uischema,
  schema,
  label,
  rootSchema,
  renderers,
  cells,
  data,
  path,
  errors,
  uischemas,
  addItem,
  removeItems,
  translations,
}: ArrayLayoutProps) => {
  const addItemCb = useCallback(
    (p: string, value: any) => addItem(p, value),
    [addItem],
  );
  return (
    <Hidden xsUp={!visible}>
      <MaterialArrayLayout
        translations={translations}
        label={label}
        uischema={uischema}
        schema={schema}
        id={id}
        rootSchema={rootSchema}
        errors={errors}
        enabled={enabled}
        visible={visible}
        data={data}
        path={path}
        addItem={addItemCb}
        removeItems={removeItems}
        renderers={renderers}
        cells={cells}
        uischemas={uischemas}
      />
    </Hidden>
  );
};

export const MaterialArrayOfLinkedItemRenderer = withJsonFormsArrayLayoutProps(
  MaterialArrayOfLinkedItemRendererComponent,
);
