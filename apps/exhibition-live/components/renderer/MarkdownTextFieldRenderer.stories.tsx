import { JsonFormsCore } from "@jsonforms/core";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import { useCallback, useState } from "react";

import { MarkdownTextFieldRenderer } from "@slub/edb-markdown-renderer";
import { materialCustomAnyOfControlTester } from "@slub/edb-layout-renderer";

export default {
  title: "form/exhibition/MarkdownTextFieldRenderer",
  component: MarkdownTextFieldRenderer,
};

const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://example.com/person.schema.json",
  title: "Person",
  description: "A human being",
  type: "object",
  properties: {
    description: {
      type: "string",
    },
  },
};

const renderers = [
  ...materialRenderers,
  {
    tester: materialCustomAnyOfControlTester,
    renderer: MarkdownTextFieldRenderer,
  },
];
export const MarkdownTextFieldRendererDefault = () => {
  const [data, setData] = useState<any>({});

  const handleFormChange = useCallback(
    ({ data }: Pick<JsonFormsCore, "data" | "errors">) => {
      setData(data);
    },
    [setData],
  );

  return (
    <JsonForms
      data={data}
      renderers={renderers}
      cells={materialCells}
      onChange={handleFormChange}
      schema={schema}
    />
  );
};
