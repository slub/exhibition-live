import { JsonFormsCore } from "@jsonforms/core";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import { useCallback, useState } from "react";
import { MaterialCustomAnyOfRenderer } from "./MaterialCustomAnyOfRenderer";
import { materialCustomAnyOfControlTester } from "./materialCustomAnyOfControlTester";

export default {
  title: "ui/form/renderer/MaterialCustomAnyOfRenderer",
  component: MaterialCustomAnyOfRenderer,
};

const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://example.com/person.schema.json",
  title: "Person",
  description: "A human being",
  type: "object",
  properties: {
    birthDate: {
      description: "The birth date of the person",
      anyOf: [
        {
          title: "nur Jahr",
          type: "integer",
          min: 1500,
          max: 2050,
        },
        {
          title: "genaues Datum",
          format: "date-time",
          type: "string",
        },
      ],
    },
  },
  required: ["birthDate"],
};

const renderers = [
  ...materialRenderers,
  {
    tester: materialCustomAnyOfControlTester,
    renderer: MaterialCustomAnyOfRenderer,
  },
];

export const MaterialCustomAnyOfRendererDefault = () => {
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
