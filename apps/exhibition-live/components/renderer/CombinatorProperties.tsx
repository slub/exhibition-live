import { Generate, JsonSchema, Layout, UISchemaElement } from "@jsonforms/core";
import { JsonFormsDispatch } from "@jsonforms/react";
import omit from "lodash/omit";
import React from "react";

interface CombinatorPropertiesProps {
  schema: JsonSchema;
  combinatorKeyword: "oneOf" | "anyOf";
  path: string;
}

export const isLayout = (uischema: UISchemaElement): uischema is Layout =>
  uischema.hasOwnProperty("elements");

export class CombinatorProperties extends React.Component<
  CombinatorPropertiesProps,
  {}
> {
  render() {
    const { schema, combinatorKeyword, path } = this.props;

    const otherProps: JsonSchema = omit(
      schema,
      combinatorKeyword,
    ) as JsonSchema;
    const foundUISchema: UISchemaElement = Generate.uiSchema(
      otherProps,
      "VerticalLayout",
    );
    let isLayoutWithElements = false;
    if (foundUISchema !== null && isLayout(foundUISchema)) {
      isLayoutWithElements = foundUISchema.elements.length > 0;
    }

    if (isLayoutWithElements) {
      return (
        <JsonFormsDispatch
          schema={otherProps}
          path={path}
          uischema={foundUISchema}
        />
      );
    }

    return null;
  }
}

export default CombinatorProperties;
