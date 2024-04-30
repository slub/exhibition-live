import { TextFieldProps, useControlled } from "@mui/material";
import parse from "html-react-parser";
import React, { FunctionComponent, useCallback, useId } from "react";

import { useGlobalCRUDOptions } from "../../state/useGlobalCRUDOptions";
import {
  AutocompleteSuggestion,
  DebouncedAutocomplete,
} from "../DebouncedAutoComplete";
import {
  defaultPrefix,
  defaultQueryBuilderOptions,
  sladb,
} from "../formConfigs";
import { useQuery } from "@tanstack/react-query";
import { findEntityByClass, loadEntityBasics } from "@slub/sparql-schema";

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
}

type Props = OwnProps;

const DiscoverAutocompleteInput: FunctionComponent<Props> = ({
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
}) => {
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
                defaultPrefix: defaultPrefix,
                queryBuildOptions: defaultQueryBuilderOptions,
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
    [typeIRI, crudOptions, limit],
  );

  const { data: basicFields } = useQuery(
    ["loadEntity", selected?.value, typeName],
    async () => {
      const value = selected?.value;
      if (value && crudOptions && crudOptions.selectFetch) {
        const typeIRI = sladb(typeName).value;
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

export default DiscoverAutocompleteInput;
