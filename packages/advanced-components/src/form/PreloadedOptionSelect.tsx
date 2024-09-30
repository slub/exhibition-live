import {
  CircularProgress,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import React, {
  FunctionComponent,
  use,
  useCallback,
  useId,
  useMemo,
} from "react";

import { useQuery } from "@slub/edb-state-hooks";
import { AutocompleteSuggestion } from "@slub/edb-core-types";
import { ClearSharp } from "@mui/icons-material";
import { useTranslation } from "next-i18next";

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
      if (value === null) {
        onChange && onChange(e as React.SyntheticEvent, null);
        return;
      }
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
  const { t } = useTranslation();
  const v = useMemo(() => value?.value ?? null, [value]);

  return (
    <>
      {isLoading && <CircularProgress size={"1em"} />}
      <InputLabel id={selectID}>{title}</InputLabel>
      <Select
        labelId={selectID}
        value={v}
        label={title}
        disabled={readOnly}
        onChange={handleOnChange}
      >
        {(suggestions || []).map((suggestion) => (
          <MenuItem key={suggestion.value} value={suggestion.value}>
            {suggestion.label}
          </MenuItem>
        ))}
        <MenuItem
          disabled={!v}
          key="empty"
          value={null}
          sx={{ fontStyle: "italic" }}
        >
          <ListItemIcon>
            <ClearSharp fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {!v ? t("no selection") : t("remove selection")}
          </ListItemText>
        </MenuItem>
      </Select>
    </>
  );
};
