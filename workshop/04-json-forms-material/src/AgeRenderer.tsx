import { withJsonFormsControlProps } from "@jsonforms/react";
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from "@jsonforms/core";
import { FormLabel, Slider } from "@mui/material";

const AgeRendererComponent = ({
  label,
  data,
  id,
  enabled,
  handleChange,
  errors,
  path,
  schema,
}: ControlProps) => (
  <>
    <FormLabel htmlFor={id}>{label}</FormLabel>
    <Slider
      value={Number(data)}
      min={schema.minimum || 0}
      max={schema.maximum || undefined}
      onChange={(_e, val) => handleChange(path, Number(val))}
      color={errors?.length > 0 ? "error" : "primary"}
      id={id}
      disabled={!enabled}
      valueLabelDisplay="on"
    />
  </>
);

export const AgeRenderer = withJsonFormsControlProps(AgeRendererComponent);
export const ageRendererTester: RankedTester = rankWith(
  4,
  scopeEndsWith("age"),
);
