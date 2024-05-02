import { JsonFormsCore, JsonSchema } from "@jsonforms/core";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { FunctionComponent, useCallback } from "react";

import { useSettings } from "@slub/edb-state-hooks";

interface OwnProps {}

type Props = OwnProps;

const schema: JsonSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    enableDebug: {
      type: "boolean",
    },
    enablePreview: {
      type: "boolean",
    },
    enableStylizedCard: {
      type: "boolean",
    },
  },
};

const FeatureForm: FunctionComponent<Props> = (props) => {
  const { features, setFeatures } = useSettings();

  const handleFormChange = useCallback(
    (state: Pick<JsonFormsCore, "data" | "errors">) => {
      setFeatures(state.data);
    },
    [setFeatures],
  );
  // a REACT MUI paper list with checkboxes
  return (
    <Box>
      <Typography variant="h2">Funktionen</Typography>
      <JsonForms
        data={features}
        schema={schema}
        renderers={materialRenderers}
        cells={materialCells}
        onChange={handleFormChange}
      />
    </Box>
  );
};

export default FeatureForm;
