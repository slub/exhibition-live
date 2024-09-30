import React, { useCallback, useState } from "react";
import {
  CellProps,
  isDescriptionHidden,
  scopeEndsWith,
  showAsRequired,
  WithClassname,
} from "@jsonforms/core";
import {
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputBaseComponentProps,
  InputLabel,
  InputProps,
  useTheme,
} from "@mui/material";
import merge from "lodash/merge";
import Close from "@mui/icons-material/Close";
import {
  JsonFormsTheme,
  useDebouncedChange,
  useFocus,
} from "@jsonforms/material-renderers";
import {
  ControlProps,
  isStringControl,
  RankedTester,
  rankWith,
  and,
} from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import {
  useAdbContext,
  useGlobalSearch,
  useKeyEventForSimilarityFinder,
  useRightDrawerState,
} from "@slub/edb-state-hooks";
import { primaryFields } from "@slub/exhibition-schema";
import { useInputComponent, useInputVariant } from "./helper";

interface MuiTextInputProps {
  muiInputProps?: InputProps["inputProps"];
  inputComponent?: InputProps["inputComponent"];
}

export const PrimaryFieldText = (
  props: CellProps & WithClassname & MuiTextInputProps,
) => {
  const { typeIRIToTypeName } = useAdbContext();
  const [showAdornment, setShowAdornment] = useState(false);
  const {
    data,
    config,
    className,
    id,
    enabled,
    uischema,
    isValid,
    path,
    handleChange,
    schema,
    muiInputProps,
    inputComponent,
  } = props;
  const maxLength = schema.maxLength;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  let inputProps: InputBaseComponentProps;
  if (appliedUiSchemaOptions.restrict) {
    inputProps = { maxLength: maxLength };
  } else {
    inputProps = {};
  }

  inputProps = merge(inputProps, muiInputProps);

  if (appliedUiSchemaOptions.trim && maxLength !== undefined) {
    inputProps.size = maxLength;
  }

  const [inputText, onChange, onClear] = useDebouncedChange(
    handleChange,
    "",
    data,
    path,
  );
  const onPointerEnter = () => setShowAdornment(true);
  const onPointerLeave = () => setShowAdornment(false);

  const theme: JsonFormsTheme = useTheme();

  const closeStyle = {
    background:
      theme.jsonforms?.input?.delete?.background ||
      theme.palette.background.default,
    borderRadius: "50%",
  };

  const { setOpen: setRightDrawerOpen } = useRightDrawerState();

  const { setPath, setTypeName } = useGlobalSearch();
  const handleFocus = useCallback(() => {
    if (!config?.typeIRI || !config.formsPath) return;
    setPath(config.formsPath);
    setTypeName(typeIRIToTypeName(config.typeIRI as string));
    setRightDrawerOpen(true);
  }, [
    config?.typeIRI,
    config?.formsPath,
    typeIRIToTypeName,
    setPath,
    setTypeName,
    setRightDrawerOpen,
  ]);

  const handleKeyUp = useKeyEventForSimilarityFinder();
  const InputComponent = useInputComponent();

  return (
    <InputComponent
      type={appliedUiSchemaOptions.format === "password" ? "password" : "text"}
      value={inputText}
      onChange={onChange}
      className={className}
      id={id}
      disabled={!enabled}
      autoFocus={appliedUiSchemaOptions.focus}
      multiline={appliedUiSchemaOptions.multi}
      fullWidth={!appliedUiSchemaOptions.trim || maxLength === undefined}
      inputProps={{
        ...inputProps,
        onFocus: handleFocus,
        onKeyUp: handleKeyUp,
      }}
      error={!isValid}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      endAdornment={
        <InputAdornment
          position="end"
          style={{
            display:
              !showAdornment || !enabled || data === undefined
                ? "none"
                : "flex",
            position: "absolute",
            right: 0,
          }}
        >
          <IconButton
            aria-label="Clear input field"
            onClick={onClear}
            size="large"
          >
            <Close style={closeStyle} />
          </IconButton>
        </InputAdornment>
      }
      inputComponent={inputComponent}
    />
  );
};

export interface WithInput {
  input: any;
}

const MaterialInputControl = (props: ControlProps & WithInput) => {
  const [focused, onFocus, onBlur] = useFocus();
  const {
    id,
    description,
    errors,
    label,
    uischema,
    visible,
    required,
    config,
    input,
  } = props;
  const variant = useInputVariant();
  const isValid = errors.length === 0;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);

  const showDescription = !isDescriptionHidden(
    visible,
    description,
    focused,
    appliedUiSchemaOptions.showUnfocusedDescription,
  );

  const firstFormHelperText = showDescription
    ? description
    : !isValid
      ? errors
      : null;
  const secondFormHelperText = showDescription && !isValid ? errors : null;
  const InnerComponent = input;

  if (!visible) {
    return null;
  }

  return (
    <FormControl
      fullWidth={!appliedUiSchemaOptions.trim}
      onFocus={onFocus}
      onBlur={onBlur}
      variant={variant}
      id={id}
    >
      <InputLabel
        htmlFor={id + "-input"}
        error={!isValid}
        required={showAsRequired(
          required,
          appliedUiSchemaOptions.hideRequiredAsterisk,
        )}
      >
        {label}
      </InputLabel>
      <InnerComponent
        {...props}
        id={id + "-input"}
        isValid={isValid}
        visible={visible}
      />
      <FormHelperText error={!isValid && !showDescription}>
        {firstFormHelperText}
      </FormHelperText>
      <FormHelperText error={!isValid}>{secondFormHelperText}</FormHelperText>
    </FormControl>
  );
};

const PrimaryTextField = (props: ControlProps) => (
  <MaterialInputControl {...props} input={PrimaryFieldText} />
);

export const primaryTextFieldControlTester: (
  typeName: string,
) => RankedTester = (typeName) =>
  rankWith(
    10,
    and(isStringControl, scopeEndsWith("/" + primaryFields[typeName]?.label)),
  );
export const PrimaryTextFieldRenderer =
  withJsonFormsControlProps(PrimaryTextField);
