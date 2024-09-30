import { TextFieldProps, useControlled } from "@mui/material";
import parse from "html-react-parser";
import React, { FunctionComponent, useCallback } from "react";

import { useAdbContext, useGlobalCRUDOptions } from "@slub/edb-state-hooks";
import { useQuery } from "@slub/edb-state-hooks";
import { findEntityByClass, loadEntityBasics } from "@slub/sparql-schema";
import { AutocompleteSuggestion } from "@slub/edb-core-types";
import { DebouncedAutocomplete } from "@slub/edb-advanced-components";

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
  autocompleteDisabled?: boolean;
  disabled?: boolean;
}

export type DiscoverAutocompleteInputProps = OwnProps;

export const DiscoverAutocompleteInput: FunctionComponent<
  DiscoverAutocompleteInputProps
> = ({
  title = "",
  typeName,
  readonly,
  defaultSelected,
  selected,
  onEnterSearch,
  onSelectionChange,
  typeIRI,
  loadOnStart,
  limit,
  onDebouncedSearchChange,
  condensed,
  inputProps,
  onSearchValueChange,
  searchString: searchStringProp,
  autocompleteDisabled,
  disabled,
}) => {
  const {
    typeNameToTypeIRI,
    queryBuildOptions,
    jsonLDConfig: { defaultPrefix },
  } = useAdbContext();
  const { crudOptions } = useGlobalCRUDOptions();
  const [selectedValue, setSelectedUncontrolled] =
    useControlled<AutocompleteSuggestion | null>({
      name: "DiscoverAutocompleteInput-selected",
      controlled: selected,
      default: defaultSelected || null,
    });

  const [searchString, setSearchString] = useControlled<string | undefined>({
    name: "DiscoverAutocompleteInput-searchString",
    controlled: searchStringProp,
    default: "",
  });
  const handleChange = useCallback(
    (e: React.SyntheticEvent, item: AutocompleteSuggestion | null) => {
      e.stopPropagation();
      e.preventDefault();
      onSelectionChange && onSelectionChange(item);
      setSelectedUncontrolled(item);
      onSearchValueChange && onSearchValueChange(null);
      setSearchString(null);
    },
    [
      onSelectionChange,
      setSelectedUncontrolled,
      onSearchValueChange,
      setSearchString,
    ],
  );

  const load = useCallback(
    async (searchString?: string) =>
      typeIRI && crudOptions
        ? (
            await findEntityByClass(
              searchString || null,
              typeIRI,
              crudOptions.selectFetch,
              {
                defaultPrefix,
                queryBuildOptions,
              },
              limit,
            )
          ).map(({ name = "", value }: { name: string; value: any }) => {
            return {
              label: name,
              value,
            };
          })
        : [],
    [typeIRI, crudOptions, limit, defaultPrefix, queryBuildOptions],
  );

  const { data: basicFields } = useQuery(
    ["loadEntity", selected?.value, typeName],
    async () => {
      const value = selected?.value;
      if (value && crudOptions && crudOptions.selectFetch) {
        const typeIRI = typeNameToTypeIRI(typeName);
        return await loadEntityBasics(value, typeIRI, crudOptions.selectFetch, {
          defaultPrefix: defaultPrefix,
        });
      }
      return null;
    },
    {
      enabled: Boolean(
        crudOptions?.selectFetch &&
          typeof selected?.value === "string" &&
          (!selected?.label || selected?.label?.length === 0),
      ),
    },
  );

  const handleEnter = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" && searchString?.length > 0) {
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

  const handleGetOptionLabel = useCallback(
    (option: AutocompleteSuggestion) => {
      return option.label || basicFields?.label || option.value || "";
    },
    [basicFields],
  );

  return (
    <DebouncedAutocomplete
      disabled={disabled}
      title={title}
      readOnly={readonly}
      loadOnStart={true}
      ready={Boolean(typeIRI && crudOptions)}
      // @ts-ignore
      load={load}
      initialQueryKey={typeIRI}
      value={selectedValue || { label: searchString, value: null }}
      getOptionLabel={handleGetOptionLabel}
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
      autocompleteDisabled={autocompleteDisabled}
    />
  );
};
