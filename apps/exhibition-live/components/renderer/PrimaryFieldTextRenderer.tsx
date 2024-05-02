import React, { useCallback, useState } from "react";
import { CellProps, scopeEndsWith, WithClassname } from "@jsonforms/core";
import {
  IconButton,
  Input,
  InputAdornment,
  InputBaseComponentProps,
  InputProps,
  useTheme,
} from "@mui/material";
import merge from "lodash/merge";
import Close from "@mui/icons-material/Close";
import {
  JsonFormsTheme,
  MaterialInputControl,
  useDebouncedChange,
} from "@jsonforms/material-renderers";
import {
  ControlProps,
  isStringControl,
  RankedTester,
  rankWith,
  and,
} from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { primaryFields, typeIRItoTypeName } from "../config";
import {
  useGlobalSearch,
  useKeyEventForSimilarityFinder,
  useRightDrawerState,
} from "@slub/edb-state-hooks";

interface MuiTextInputProps {
  muiInputProps?: InputProps["inputProps"];
  inputComponent?: InputProps["inputComponent"];
}
export const PrimaryFieldText = React.memo(
  (props: CellProps & WithClassname & MuiTextInputProps) => {
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
      setTypeName(typeIRItoTypeName(config.typeIRI as string));
      setRightDrawerOpen(true);
    }, [
      config?.typeIRI,
      config?.formsPath,
      setPath,
      setTypeName,
      setRightDrawerOpen,
    ]);

    const handleKeyUp = useKeyEventForSimilarityFinder();

    return (
      <>
        <Input
          type={
            appliedUiSchemaOptions.format === "password" ? "password" : "text"
          }
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
      </>
    );
  },
);

const PrimaryTextField = (props: ControlProps) => (
  <MaterialInputControl {...props} input={PrimaryFieldText} />
);

export const primaryTextFieldControlTester: (
  typeName: string,
) => RankedTester = (typeName) =>
  rankWith(
    10,
    and(isStringControl, scopeEndsWith(primaryFields[typeName].label)),
  );
export const PrimaryTextFieldRenderer =
  withJsonFormsControlProps(PrimaryTextField);
