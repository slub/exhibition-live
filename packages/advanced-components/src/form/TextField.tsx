import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
} from "@mui/material";
import React, { FunctionComponent } from "react";

export type TextFieldProps = MuiTextFieldProps;

export const TextField: FunctionComponent<TextFieldProps> = ({ ...props }) => (
  <MuiTextField
    InputLabelProps={{ shrink: true }}
    sx={{
      mt: 1,
      mb: 1,
      ...props.sx,
      "& fieldset": {
        borderRadius: "6px",
        borderWidth: "1px",
      },
    }}
    {...props}
  />
);
