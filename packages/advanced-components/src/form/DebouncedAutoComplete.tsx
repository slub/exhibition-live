import { Link, Search } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import Autocomplete, { AutocompleteProps } from "@mui/material/Autocomplete";
import debounce from "lodash-es/debounce";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { TextField } from "./TextField";
import { useQuery } from "@slub/edb-state-hooks";
import { useTranslation } from "next-i18next";
import { AutocompleteSuggestion } from "@slub/edb-core-types";

export type DebouncedAutocompleteProps = {
  load: (value?: string) => Promise<AutocompleteSuggestion[]>;
  initialQueryKey?: string;
  placeholder: string;
  minSearchLength?: number;
  loadOnStart?: boolean;
  ready?: boolean;
  readOnly?: boolean;
  onDebouncedSearchChange?: (value: string | undefined) => void;
  condensed?: boolean;
  onSearchValueChange?: (value: string | undefined) => void;
  inputProps?: any;
  autocompleteDisabled?: boolean;
} & Omit<
  AutocompleteProps<any, any, any, any>,
  "renderInput" | "size" | "options"
>;

const emptySuggestions: AutocompleteSuggestion[] = [
  {
    label: "",
    value: null,
  },
];
export const DebouncedAutocomplete: FunctionComponent<
  DebouncedAutocompleteProps
> = ({
  load,
  initialQueryKey,
  title,
  minSearchLength = 1,
  loadOnStart,
  ready = true,
  readOnly,
  onSearchValueChange,
  onDebouncedSearchChange,
  condensed,
  inputProps,
  value,
  autocompleteDisabled,
  ...props
}) => {
  const [suggestions, setSuggestions] = useState<
    AutocompleteSuggestion[] | undefined
  >(emptySuggestions);
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedRequest = useCallback(
    debounce(async (value: string) => {
      const data = await load(value);
      onDebouncedSearchChange && onDebouncedSearchChange(value);
      if (data.length > 0) {
        setSuggestions([...data, ...emptySuggestions]);
      } else {
        setSuggestions(emptySuggestions);
      }
      setLoading(false);
    }, 500),
    [setLoading, setSuggestions, load, onDebouncedSearchChange],
  );

  const handleOnChange = useCallback(
    (e: any): void => {
      const value = e.currentTarget.value;
      onSearchValueChange && onSearchValueChange(value);
      if (value.length >= minSearchLength && !autocompleteDisabled) {
        setLoading(true);
        debouncedRequest(value);
      }
    },
    [
      setLoading,
      debouncedRequest,
      minSearchLength,
      onSearchValueChange,
      autocompleteDisabled,
    ],
  );
  const { data: initialData, isLoading } = useQuery(
    ["initiallyLoadSuggestions", initialQueryKey],
    () => load(),
    {
      enabled: Boolean(initialQueryKey && loadOnStart && ready),
    },
  );

  useEffect(() => {
    if (initialData?.length > 0) {
      setSuggestions([...initialData, ...emptySuggestions]);
    }
  }, [initialData, setSuggestions]);

  return (
    <Autocomplete
      noOptionsText={t("no suggestions")}
      readOnly={readOnly}
      open={autocompleteDisabled ? false : undefined}
      openOnFocus={!autocompleteDisabled}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      value={value}
      {...props}
      renderInput={(params) => (
        // @ts-ignore
        <TextField
          {...params}
          label={condensed ? undefined : title}
          placeholder={condensed ? title : props.placeholder}
          onChange={handleOnChange}
          InputProps={{
            ...params.InputProps,
            disabled: readOnly,
            startAdornment: (
              <>
                {isLoading || loading ? (
                  <CircularProgress color="inherit" size={16} />
                ) : readOnly ? (
                  <Link fontSize="small" />
                ) : (
                  <Search fontSize="small" />
                )}
                {params.InputProps.startAdornment}
              </>
            ),
          }}
          {...inputProps}
        />
      )}
      options={autocompleteDisabled ? [] : suggestions}
    />
  );
};
