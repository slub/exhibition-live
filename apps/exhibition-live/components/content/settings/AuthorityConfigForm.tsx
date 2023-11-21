import { JsonFormsCore, JsonSchema } from "@jsonforms/core";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { JSONSchema7 } from "json-schema";
import React, { FunctionComponent, useCallback, useEffect } from "react";

import { useSettings } from "../../state/useLocalSettings";

interface OwnProps {}

type Props = OwnProps;

const schema: JsonSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    kxp: {
      type: "object",
      properties: {
        endpoint: {
          type: "string",
          title: "Such-Endpunkt",
          format: "uri",
        },
        baseURL: {
          type: "string",
          title: "Detailabfrage Endpunkt",
          format: "uri",
        },
        recordSchema: {
          type: "string",
        },
      },
    },
  },
};

const AuthorityConfigForm: FunctionComponent<Props> = (props) => {
  const { externalAuthority, setAuthorityConfig } = useSettings();

  const handleFormChange = useCallback(
    (state: Pick<JsonFormsCore, "data" | "errors">) => {
      setAuthorityConfig(state.data);
    },
    [setAuthorityConfig],
  );

  useEffect(() => {
    if (!externalAuthority?.kxp?.endpoint || !externalAuthority?.kxp?.baseURL) {
      setAuthorityConfig({
        kxp: {
          endpoint: "https://sru.bsz-bw.de/swbtest",
          baseURL: "https://kxp.k10plus.de",
          recordSchema: "marcxmlk10os",
          ...(externalAuthority?.kxp || {}),
        },
      });
    }
  }, [externalAuthority, setAuthorityConfig]);
  // a REACT MUI paper list with checkboxes
  return (
    <Box>
      <Typography variant="h2">Autoritäten / Normdaten </Typography>
      <JsonForms
        data={externalAuthority || {}}
        schema={schema}
        renderers={materialRenderers}
        cells={materialCells}
        onChange={handleFormChange}
      />
    </Box>
  );
};

export default AuthorityConfigForm;
