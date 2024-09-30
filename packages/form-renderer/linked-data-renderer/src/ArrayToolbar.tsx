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

import { useCallback, useMemo } from "react";
import { JsonSchema7 } from "@jsonforms/core";
import {
  useAdbContext,
  useGlobalSearchWithHelper,
  useKeyEventForSimilarityFinder,
  useRightDrawerState,
} from "@slub/edb-state-hooks";
import { JSONSchema7 } from "json-schema";
import { AutocompleteSuggestion } from "@slub/edb-core-types";
import { NoteAdd } from "@mui/icons-material";
import { PrimaryField, PrimaryFieldDeclaration } from "@slub/edb-core-types";
import { SearchbarWithFloatingButton } from "@slub/edb-basic-components";
import { DiscoverAutocompleteInput } from "@slub/edb-advanced-components";
import { KnowledgeSources } from "@slub/edb-global-types";

export interface ArrayLayoutToolbarProps {
  label: string;
  errors: string;
  path: string;

  enabled?: boolean;

  labelAsHeadline?: boolean;

  addItem(path: string, data: any): () => void;

  createDefault(): any;

  readonly?: boolean;
  typeIRI?: string;
  onCreate?: () => void;
  isReifiedStatement?: boolean;
  additionalKnowledgeSources?: string[];
}

const getDefaultLabelKey = (
  typeName: string,
  primaryFields: PrimaryFieldDeclaration,
) => {
  const fieldDefinitions = primaryFields[typeName] as PrimaryField | undefined;
  return fieldDefinitions?.label || "title";
};
export const ArrayLayoutToolbar = ({
  label,
  labelAsHeadline,
  errors,
  addItem,
  enabled,
  path,
  schema,
  readonly,
  onCreate,
  isReifiedStatement,
  formsPath,
  additionalKnowledgeSources,
}: ArrayLayoutToolbarProps & {
  schema?: JsonSchema7;
  formsPath?: string;
}) => {
  const {
    createEntityIRI,
    queryBuildOptions: { primaryFields },
    typeIRIToTypeName,
    components: { SimilarityFinder },
  } = useAdbContext();
  const { t } = useTranslation();
  const typeIRI = useMemo(() => schema?.properties?.["@type"]?.const, [schema]);
  const typeName = useMemo(
    () => typeIRIToTypeName(typeIRI),
    [typeIRI, typeIRIToTypeName],
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
        "@id": createEntityIRI(typeName),
        "@type": typeIRI,
        __draft: true,
        [getDefaultLabelKey(typeName, primaryFields)]: value,
      })();
    },
    [addItem, path, typeName, typeIRI, primaryFields],
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
      const label =
        data[getDefaultLabelKey(typeName, primaryFields)] || data.label || iri;
      //handleSelectedChange({ value: iri, label });
      addItem(path, data)();
      inputRef.current?.focus();
    },
    [addItem, typeName],
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
      {(isReifiedStatement || labelAsHeadline) && (
        <Box>
          <Typography variant={"h4"}>{label}</Typography>
        </Box>
      )}
      <Box>
        {(keepMounted || sidebarOpen) && !isReifiedStatement ? (
          <TextField
            fullWidth
            disabled={Boolean(readonly) || enabled === false}
            label={labelAsHeadline ? typeName : label}
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
                      disabled={Boolean(readonly || enabled === false)}
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
              additionalKnowledgeSources={
                additionalKnowledgeSources as KnowledgeSources[]
              }
            />
          </SearchbarWithFloatingButton>
        )}
      </Box>
    </Box>
  );
};
