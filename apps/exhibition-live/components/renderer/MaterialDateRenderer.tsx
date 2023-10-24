import {
  ControlProps,
  isDateControl,
  isDescriptionHidden,
  RankedTester,
  rankWith,
} from "@jsonforms/core";
import {
  createOnChangeHandler,
  getData,
  useFocus,
} from "@jsonforms/material-renderers";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { DatePicker, LocalizationProvider } from "@mui/lab";
import AdapterDayjs from "@mui/lab/AdapterDayjs";
import { FormHelperText, Hidden, TextField } from "@mui/material";
import merge from "lodash/merge";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const MaterialDateControl = (props: ControlProps) => {
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
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const showDescription = !isDescriptionHidden(
    visible,
    description,
    focused,
    appliedUiSchemaOptions.showUnfocusedDescription,
  );

  const { t } = useTranslation();
  const format = appliedUiSchemaOptions.dateFormat ?? t("date_format");
  const saveFormat = appliedUiSchemaOptions.dateSaveFormat ?? "YYYY-MM-DD";

  const firstFormHelperText = showDescription
    ? description
    : !isValid
    ? errors
    : null;
  const secondFormHelperText = showDescription && !isValid ? errors : null;
  const onChange = useMemo(
    () => createOnChangeHandler(path, handleChange, saveFormat),
    [path, handleChange, saveFormat],
  );

  return (
    <Hidden xsUp={!visible}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label={label}
          value={getData(data, saveFormat)}
          clearable
          // @ts-ignore
          onChange={(d) => d && onChange(d)}
          inputFormat={format}
          disableMaskedInput
          views={appliedUiSchemaOptions.views}
          disabled={!enabled}
          cancelText={appliedUiSchemaOptions.cancelLabel}
          clearText={appliedUiSchemaOptions.clearLabel}
          okText={appliedUiSchemaOptions.okLabel}
          // @ts-ignore
          renderInput={(params) => (
            <TextField
              {...params}
              id={id + "-input"}
              required={
                required && !appliedUiSchemaOptions.hideRequiredAsterisk
              }
              autoFocus={appliedUiSchemaOptions.focus}
              error={!isValid}
              fullWidth={!appliedUiSchemaOptions.trim}
              inputProps={{ ...params.inputProps, type: "text" }}
              InputLabelProps={data ? { shrink: true } : undefined}
              onFocus={onFocus}
              onBlur={onBlur}
              variant={"standard"}
            />
          )}
        />
        <FormHelperText error={!isValid && !showDescription}>
          {firstFormHelperText}
        </FormHelperText>
        <FormHelperText error={!isValid}>{secondFormHelperText}</FormHelperText>
      </LocalizationProvider>
    </Hidden>
  );
};

export const materialDateControlTester: RankedTester = rankWith(
  6,
  isDateControl,
);

export default withJsonFormsControlProps(MaterialDateControl);
