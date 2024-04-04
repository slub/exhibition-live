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
import {
  FormControl,
  FormGroup,
  FormHelperText,
  FormLabel,
  Hidden,
  TextField,
} from "@mui/material";
import { getDatePart, getPaddedDatePart, leftpad } from "@slub/edb-core-utils";
import React, { useCallback } from "react";

const getDatePartAsString = (date: number, part: "day" | "month" | "year") => {
  const value = getDatePart(date, part);
  if (value === 0) return "";
  const maxLength = part === "year" ? 4 : 2;
  return leftpad(value, maxLength);
};

export const AdbSpecialDateControl = (props: ControlProps) => {
  const [focused, onFocus, onBlur] = useFocus();
  const {
    description,
    id,
    errors,
    label,
    uischema,
    visible,
    enabled,
    required,
    path,
    handleChange,
    data,
    config,
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

  const handleTextFieldChange = useCallback(
    (
      event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
      field: "day" | "month" | "year",
    ) => {
      const maxLength = field === "year" ? 4 : 2,
        maxValue = field === "year" ? 9999 : field === "month" ? 12 : 31,
        newValueNumber = Number(event.target.value);
      if (isNaN(newValueNumber) || newValueNumber > maxValue) return;
      const newValue = String(newValueNumber);
      if (newValue.length > maxLength) return;
      let strData, paddedValue;
      try {
        paddedValue = leftpad(newValueNumber, maxLength);
      } catch (e) {
        return;
      }

      // check if the day is valid, if not, set it to the last day of the month (and handle leap years)
      let changeDay =
        field === "day" ? paddedValue : getPaddedDatePart(data, "day");
      const currentMonth = getDatePart(data, "month"),
        currentYear = getDatePart(data, "year");
      if (currentMonth > 0) {
        const lastDayOfMonth = new Date(
          currentYear ?? 4,
          currentMonth,
          0,
        ).getDate();
        if (Number(changeDay) > lastDayOfMonth) {
          changeDay = leftpad(lastDayOfMonth, 2);
        }
      }
      if (field === "day")
        strData =
          getPaddedDatePart(data, "year") +
          getPaddedDatePart(data, "month") +
          changeDay;
      else if (field === "month")
        strData = getPaddedDatePart(data, "year") + paddedValue + changeDay;
      else strData = paddedValue + getPaddedDatePart(data, "month") + changeDay;
      handleChange(path, Number(strData));
    },
    [path, handleChange, data],
  );

  return (
    <Hidden xsUp={!visible}>
      <FormControl>
        {label && label.length > 0 && <FormLabel>{label}</FormLabel>}
        <FormGroup row={true}>
          <TextField
            variant={"standard"}
            disabled={!enabled}
            sx={{ width: "4em" }}
            label={"Tag"}
            value={getDatePartAsString(data ?? 0, "day")}
            onChange={(e) => handleTextFieldChange(e, "day")}
          />
          <TextField
            variant={"standard"}
            disabled={!enabled}
            sx={{ width: "4em" }}
            onChange={(e) => handleTextFieldChange(e, "month")}
            label={"Monat"}
            value={getDatePartAsString(data ?? 0, "month")}
          />
          <TextField
            variant={"standard"}
            disabled={!enabled}
            sx={{ width: "6em" }}
            onChange={(e) => handleTextFieldChange(e, "year")}
            label={"Jahr"}
            value={getDatePartAsString(data ?? 0, "year")}
          />
        </FormGroup>
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
