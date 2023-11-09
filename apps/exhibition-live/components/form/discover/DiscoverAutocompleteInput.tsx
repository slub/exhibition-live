import { TextFieldProps, useControlled } from "@mui/material";
import parse from "html-react-parser";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useGlobalCRUDOptions } from "../../state/useGlobalCRUDOptions";
import { findEntityByClass } from "../../utils/discover";
import {
  AutocompleteSuggestion,
  DebouncedAutocomplete,
} from "../DebouncedAutoComplete";

interface OwnProps {
  selected?: AutocompleteSuggestion | null;
  onSelectionChange?: (selection: AutocompleteSuggestion | null) => void;
  typeIRI?: string;
  title?: string;
  typeName?: string;
  readonly?: boolean;
  defaultSelected?: AutocompleteSuggestion | null;
  loadOnStart?: boolean;
  limit?: number;
  onDebouncedSearchChange?: (value: string | undefined) => void;
  condensed?: boolean;
  onEnterSearch?: (value: string | undefined) => void;
  inputProps?: TextFieldProps;
  onSearchValueChange?: (value: string | undefined) => void;
  searchString?: string;
}

type Props = OwnProps;

const DiscoverAutocompleteInput: FunctionComponent<Props> = ({
  title = "etwas",
  typeName,
  readonly,
  defaultSelected,
  selected,
  onEnterSearch,
  onSelectionChange,
  typeIRI: classType,
  loadOnStart,
  limit,
  onDebouncedSearchChange,
  condensed,
  inputProps,
  onSearchValueChange,
  searchString: searchStringProp,
}) => {
  const { crudOptions } = useGlobalCRUDOptions();
  const [selectedValue, setSelectedUncontrolled] = useControlled({
    name: "DiscoverAutocompleteInput",
    controlled: selected,
    default: defaultSelected || null,
  });

  const handleChange = useCallback(
    (_e: Event, item: AutocompleteSuggestion | null) => {
      onSelectionChange && onSelectionChange(item);
      setSelectedUncontrolled(item);
    },
    [onSelectionChange, setSelectedUncontrolled],
  );

  const load = useCallback(
    async (searchString?: string) =>
      classType && crudOptions
        ? (
            await findEntityByClass(
              searchString || null,
              classType,
              crudOptions.selectFetch,
              limit,
            )
          ).map(({ name = "", value }: { name: string; value: any }) => {
            return {
              label: name,
              value,
            };
          })
        : [],
    [classType, crudOptions, limit],
  );

  const [searchString, setSearchString] = useControlled<string | undefined>({
    name: "DiscoverAutocompleteInput",
    controlled: searchStringProp,
    default: "",
  });
  const handleEnter = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter") {
        onEnterSearch && onEnterSearch(searchString);
      }
    },
    [onEnterSearch, searchString],
  );

  const handleSearchValueChange = useCallback(
    (value: string | undefined) => {
      onSearchValueChange && onSearchValueChange(value);
      setSearchString(value);
    },
    [onSearchValueChange, setSearchString],
  );

  return (
    <>
      <DebouncedAutocomplete
        title={title}
        readOnly={readonly}
        loadOnStart={true}
        ready={Boolean(classType && crudOptions)}
        // @ts-ignore
        load={load}
        value={selectedValue || null}
        placeholder={`Suche nach ${typeName} in der aktuellen Datenbank`}
        renderOption={(props, option: any) => (
          <li {...props} key={option.value}>
            {parse(
              `<span class="debounced_autocomplete_option_label">${option.label}</span>`,
            )}
          </li>
        )}
        // @ts-ignore
        onChange={handleChange}
        onDebouncedSearchChange={onDebouncedSearchChange}
        condensed={condensed}
        onKeyUp={handleEnter}
        onSearchValueChange={handleSearchValueChange}
        inputProps={inputProps}
      />
    </>
  );
};

export default DiscoverAutocompleteInput;
