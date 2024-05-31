import {
  CircularProgress,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import React, { FunctionComponent, useCallback, useId } from "react";

import { useQuery } from "@slub/edb-state-hooks";
import { AutocompleteSuggestion } from "@slub/edb-core-types";

export type PreloadedOptionSelect = {
  title: string;
  load: (value?: string) => Promise<AutocompleteSuggestion[]>;
  value?: AutocompleteSuggestion | null;
  typeIRI: string;
  onChange?: (
    e: React.SyntheticEvent,
    value: AutocompleteSuggestion | null,
  ) => void;
  readOnly?: boolean;
};

const emptySuggestions: AutocompleteSuggestion[] = [
  {
    label: "",
    value: null,
  },
];
export const PreloadedOptionSelect: FunctionComponent<
  PreloadedOptionSelect
> = ({ load, title, readOnly, value, typeIRI, onChange }) => {
  const { data: suggestions, isLoading } = useQuery(
    ["suggestions", typeIRI],
    () => {
      return load();
    },
    { enabled: true },
  );

  const handleOnChange = useCallback(
    (e: SelectChangeEvent<string>): void => {
      const value = e.target.value;
      const selected = suggestions?.find(
        (suggestion) => suggestion.value === value,
      );
      if (selected) {
        onChange && onChange(e as React.SyntheticEvent, selected);
      }
    },
    [onChange, suggestions],
  );

  const selectID = useId();

  return (
    <>
      {isLoading && <CircularProgress size={"1em"} />}
      <InputLabel id={selectID}>{title}</InputLabel>
      <Select
        labelId={selectID}
        value={value?.value || ""}
        label={title}
        disabled={readOnly}
        onChange={handleOnChange}
      >
        {[...(suggestions || []), ...emptySuggestions].map((suggestion) => (
          <MenuItem key={suggestion.value} value={suggestion.value}>
            {suggestion.label}
          </MenuItem>
        ))}
      </Select>
    </>
  );
};
