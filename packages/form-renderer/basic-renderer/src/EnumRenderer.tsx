import { JsonSchema } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Hidden from "@mui/material/Hidden";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import React from "react";
import { useTranslation } from "next-i18next";

type EnumRendererProps = {
  data: any;
  handleChange(path: string, value: any): void;
  path: string;
  label: string;
  schema: JsonSchema;
  visible?: boolean;
};

const EnumRendererComponent = ({
  data,
  handleChange,
  path,
  label,
  schema,
  visible,
}: EnumRendererProps) => {
  const { t } = useTranslation();

  return (
    <Hidden xsUp={!visible}>
      <FormControl>
        <FormLabel id={`enum-label-${path}`}>{t(label)}</FormLabel>
        <RadioGroup
          value={data || null}
          onChange={(ev) => handleChange(path, ev.target.value)}
          aria-labelledby={`enum-label-${path}`}
          sx={{ flexDirection: "row" }}
        >
          {(schema.enum || []).map((value) => (
            <FormControlLabel
              key={value}
              value={value}
              control={<Radio />}
              label={`${t(value)}`}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Hidden>
  );
};

export const EnumRenderer = withJsonFormsControlProps(EnumRendererComponent);
