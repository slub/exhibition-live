import {
  and,
  ControlProps,
  isDescriptionHidden,
  isIntegerControl,
  or,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from "@jsonforms/core";
import { useFocus } from "@jsonforms/material-renderers";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { FormControl, FormHelperText, FormLabel, Hidden } from "@mui/material";
import React, { useMemo } from "react";
import { AdbSpecialDateFormGroup } from "./AdbSpecialDateFormGroup";

export const AdbSpecialDateControl = (props: ControlProps) => {
  const [focused] = useFocus();
  const {
    description,
    errors,
    label,
    visible,
    enabled,
    path,
    handleChange,
    data,
  } = props;
  const isValid = errors.length === 0;
  //const appliedUiSchemaOptions = merge({}, config, uischema.options)
  const showDescription = !isDescriptionHidden(
    visible,
    description,
    focused,
    true,
  );

  const firstFormHelperText = showDescription
    ? description
    : !isValid
      ? errors
      : null;
  const secondFormHelperText = showDescription && !isValid ? errors : null;

  const numberData = useMemo(() => {
    const num = Number(data);
    return isNaN(num) ? undefined : num;
  }, [data]);

  return (
    <Hidden xsUp={!visible}>
      <FormControl>
        {label && label.length > 0 && <FormLabel>{label}</FormLabel>}
        <AdbSpecialDateFormGroup
          data={numberData}
          handleChange={(value) => handleChange(path, value)}
          disabled={!enabled}
        />
        <FormHelperText error={!isValid && !showDescription}>
          {firstFormHelperText}
        </FormHelperText>
        <FormHelperText error={!isValid}>{secondFormHelperText}</FormHelperText>
      </FormControl>
    </Hidden>
  );
};

export const adbSpecialDateControlTester: RankedTester = rankWith(
  6,
  and(isIntegerControl, or(scopeEndsWith("dateValue"), scopeEndsWith("Date"))),
);

export default withJsonFormsControlProps(AdbSpecialDateControl);
