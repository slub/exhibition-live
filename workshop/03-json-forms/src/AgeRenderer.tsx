import { withJsonFormsControlProps } from "@jsonforms/react";
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from "@jsonforms/core";

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
  <input
    aria-label={label}
    value={Number(data)}
    type="number"
    min={schema.minimum || 0}
    max={schema.maximum || undefined}
    onChange={(e) => handleChange(path, Number(e.target.value))}
    style={{ backgroundColor: errors?.length > 0 ? "red" : "initial" }}
    id={id}
    disabled={!enabled}
  />
);

export const AgeRenderer = withJsonFormsControlProps(AgeRendererComponent);
export const ageRendererTester: RankedTester = rankWith(
  4,
  scopeEndsWith("age"),
);
