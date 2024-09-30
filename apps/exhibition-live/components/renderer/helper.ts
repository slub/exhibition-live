import {
  FilledInput,
  Input,
  InputBaseProps,
  OutlinedInput,
  TextFieldProps,
  useThemeProps,
} from "@mui/material";

export interface WithInputProps {
  label?: string;
}

const variantToInput = {
  standard: Input,
  filled: FilledInput,
  outlined: OutlinedInput,
};

export const defaultInputVariant: TextFieldProps["variant"] = "standard";

export function useInputVariant(): TextFieldProps["variant"] {
  const { variant = defaultInputVariant } = useThemeProps({
    props: {} as TextFieldProps,
    name: "MuiTextField",
  });
  return variant;
}

export function useInputComponent(): React.JSXElementConstructor<
  InputBaseProps & WithInputProps
> {
  const variant = useInputVariant();
  return variantToInput[variant] ?? variantToInput[defaultInputVariant];
}
