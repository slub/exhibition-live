import {
  Box,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "next-i18next";
import { v4 as uuidv4 } from "uuid";

import DiscoverAutocompleteInput from "../form/discover/DiscoverAutocompleteInput";
import { useCallback, useMemo } from "react";
import { JsonSchema7 } from "@jsonforms/core";
import { slent } from "../form/formConfigs";
import { BASE_IRI, primaryFields, typeIRItoTypeName } from "../config";
import { memo } from "./config";
import {
  useGlobalSearchWithHelper,
  useKeyEventForSimilarityFinder,
  useRightDrawerState,
  useSimilarityFinderState,
} from "../state";
import { SearchbarWithFloatingButton } from "../layout/main-layout/Searchbar";
import SimilarityFinder from "../form/SimilarityFinder";
import { JSONSchema7 } from "json-schema";
import { AutocompleteSuggestion } from "../form/DebouncedAutoComplete";
import { NoteAdd } from "@mui/icons-material";
import { PrimaryField } from "../utils/types";

export interface ArrayLayoutToolbarProps {
  label: string;
  errors: string;
  path: string;

  addItem(path: string, data: any): () => void;

  createDefault(): any;

  readonly?: boolean;
  typeIRI?: string;
  onCreate?: () => void;
  isReifiedStatement?: boolean;
}

const getDefaultLabelKey = (typeIRI?: string) => {
  const typeName = typeIRItoTypeName(typeIRI);
  const fieldDefinitions = primaryFields[typeName] as PrimaryField | undefined;
  return fieldDefinitions?.label || "title";
};
export const ArrayLayoutToolbar = memo(
  ({
    label,
    errors,
    addItem,
    path,
    schema,
    readonly,
    onCreate,
    isReifiedStatement,
    formsPath,
  }: ArrayLayoutToolbarProps & {
    schema?: JsonSchema7;
    formsPath?: string;
  }) => {
    const { t } = useTranslation();
    const typeIRI = useMemo(
      () => schema?.properties?.["@type"]?.const,
      [schema],
    );
    const handleSelectedChange = React.useCallback(
      (v: AutocompleteSuggestion) => {
        if (!v) return;
        addItem(path, {
          "@id": v.value,
          __label: v.label,
        })();
      },
      [addItem, path],
    );
    const handleCreateNewFromSearch = React.useCallback(
      (value?: string) => {
        if (!value) return;
        addItem(path, {
          "@id": slent(uuidv4()).value,
          "@type": typeIRI,
          __draft: true,
          [getDefaultLabelKey(typeIRI)]: value,
        })();
      },
      [addItem, path, typeIRI],
    );
    const typeName = useMemo(
      () => typeIRI?.substring(BASE_IRI.length, typeIRI.length),
      [typeIRI],
    );
    const handleEntityIRIChange = useCallback(
      (iri: string) => {
        handleSelectedChange({ value: iri, label: iri });
      },
      [handleSelectedChange],
    );

    const handleExistingEntityAccepted = useCallback(
      (iri: string, data: any) => {
        console.log("onExistingEntityAccepted", { iri, data });
        const label = data[getDefaultLabelKey(typeIRI)] || data.label || iri;
        //handleSelectedChange({ value: iri, label });
        addItem(path, data)();
        inputRef.current?.focus();
      },
      [addItem, typeIRI],
    );

    const handleMappedDataAccepted = useCallback(
      (newData: any) => {
        addItem(path, newData)();
        inputRef.current?.focus();
      },
      [addItem, path],
    );

    const { open: sidebarOpen } = useRightDrawerState();

    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const {
      path: globalPath,
      searchString,
      handleSearchStringChange,
      handleMappedData,
      handleFocus,
      isActive,
    } = useGlobalSearchWithHelper(
      typeName,
      typeIRI,
      schema as JSONSchema7,
      formsPath,
      handleMappedDataAccepted,
    );

    const handleKeyUp = useKeyEventForSimilarityFinder();
    const { keepMounted } = useRightDrawerState();

    return (
      <Box>
        {isReifiedStatement && (
          <Box>
            <Typography variant={"h4"}>{label}</Typography>
          </Box>
        )}
        <Box>
          {(keepMounted || sidebarOpen) && !isReifiedStatement ? (
            <TextField
              fullWidth
              disabled={Boolean(readonly)}
              label={label}
              variant="standard"
              onChange={(ev) => handleSearchStringChange(ev.target.value)}
              value={searchString || ""}
              sx={(theme) => ({
                marginTop: theme.spacing(1),
                marginBottom: theme.spacing(1),
              })}
              inputProps={{
                ref: inputRef,
                onFocus: handleFocus,
                onKeyUp: handleKeyUp,
              }}
            />
          ) : (
            <Grid container direction={"column"}>
              {!isReifiedStatement && (
                <Grid item>
                  <Grid
                    container
                    sx={{
                      alignItems: "center",
                      visibility: readonly ? "hidden" : "visible",
                    }}
                  >
                    <Grid
                      item
                      flex={1}
                      sx={{
                        minWidth: "25em",
                        transition: "all 0.3s ease-in-out",
                      }}
                    >
                      <DiscoverAutocompleteInput
                        typeIRI={typeIRI}
                        typeName={typeName}
                        title={label || ""}
                        onEnterSearch={handleCreateNewFromSearch}
                        searchString={searchString || ""}
                        onSearchValueChange={handleSearchStringChange}
                        onSelectionChange={handleSelectedChange}
                        autocompleteDisabled={sidebarOpen}
                        inputProps={{
                          onFocus: handleFocus,
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <Tooltip
                        id="tooltip-add"
                        title={t("create new", { item: label }) || ""}
                        placement="bottom"
                      >
                        <IconButton
                          aria-label={t("create new", { item: label })}
                          onClick={onCreate}
                          size="large"
                        >
                          <NoteAdd />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
          )}
          {globalPath === formsPath && (
            <SearchbarWithFloatingButton>
              <SimilarityFinder
                finderId={`${formsPath}_${path}`}
                search={searchString}
                data={{}}
                classIRI={typeIRI}
                jsonSchema={schema as JSONSchema7}
                onExistingEntityAccepted={handleExistingEntityAccepted}
                onMappedDataAccepted={handleMappedData}
              />
            </SearchbarWithFloatingButton>
          )}
        </Box>
      </Box>
    );
  },
);
