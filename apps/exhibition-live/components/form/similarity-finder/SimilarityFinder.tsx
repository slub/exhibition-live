import { Resolve } from "@jsonforms/core";
import { NoteAdd } from "@mui/icons-material";
import { Button, CircularProgress, Grid, Hidden, List } from "@mui/material";
import * as React from "react";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAdbContext,
  useDataStore,
  useGlobalCRUDOptions,
  useGlobalSearch,
  useModalRegistry,
  useSimilarityFinderState,
} from "@slub/edb-state-hooks";
import { useTranslation } from "next-i18next";
import NiceModal from "@ebay/nice-modal-react";
import { debounce, uniq } from "lodash";
import { PrimaryField } from "@slub/edb-core-types";
import { NumberInput } from "../NumberInput";
import { ClassicResultListWrapper } from "@slub/edb-basic-components";
import {
  KnowledgeSources,
  SimilarityFinderProps,
} from "@slub/edb-global-types";
import { FindOptions, KnowledgeBaseDescription } from "./types";
import { SearchFieldWithBadges } from "./SearchFieldWithBadges";
import { useKnowledgeBases } from "./useKnowledgeBases";
import { useDeclarativeMapper } from "./useDeclarativeMapper";

const performSearch = (
  searchString: string,
  typeIRI: string,
  typeName: string,
  findOptions: FindOptions,
  knowledgeBases: KnowledgeBaseDescription<any>[],
  setSearchResults: (searchResults: Record<KnowledgeSources, any[]>) => void,
  setElementCount: (resultCount: number) => void,
) => {
  return Promise.all(
    knowledgeBases.map(async (kb) => {
      return {
        [kb.id]: await kb.find(searchString, typeIRI, typeName, findOptions),
      };
    }),
  ).then((results) => {
    if (!results) return;
    const searchResults = Object.assign({}, ...results) as Record<
      KnowledgeSources,
      any[]
    >;
    setSearchResults(searchResults);
    const resultCount = Object.values(searchResults).reduce(
      (acc, list = []) => acc + list.length,
      0,
    );
    setElementCount(resultCount);
  });
};

export const SimilarityFinder: FunctionComponent<SimilarityFinderProps> = ({
  finderId,
  data,
  classIRI: preselectedClassIRI,
  onEntityIRIChange,
  onExistingEntityAccepted,
  onMappedDataAccepted,
  onSelectedEntityChange,
  searchOnDataPath,
  search,
  jsonSchema,
  hideFooter,
  knowledgeSources,
  additionalKnowledgeSources,
}) => {
  const {
    schema,
    queryBuildOptions,
    normDataMapping,
    createEntityIRI,
    typeNameToTypeIRI,
    typeIRIToTypeName,
    jsonLDConfig: { defaultPrefix },
    components: { EditEntityModal },
  } = useAdbContext();
  const [typeName, setTypeName] = useState(
    typeIRIToTypeName(preselectedClassIRI),
  );
  const allKnowledgeBases: KnowledgeBaseDescription[] = useKnowledgeBases();
  const selectedKnowledgeSources = useMemo(() => {
    const preselectedKnowledgeSources =
      knowledgeSources ||
      allKnowledgeBases
        .filter((kb) => normDataMapping[kb.authorityIRI]?.mapping?.[typeName])
        .map((kb) => kb.id);

    return uniq([
      "kb",
      ...preselectedKnowledgeSources,
      ...(additionalKnowledgeSources || []),
    ]);
  }, [
    additionalKnowledgeSources,
    knowledgeSources,
    normDataMapping,
    allKnowledgeBases,
    typeName,
  ]);

  const { prefixes, primaryFields } = queryBuildOptions;
  const {
    search: globalSearch,
    typeName: globalTypeName,
    path: globalPath,
    setSearch,
  } = useGlobalSearch();

  const [limit, setLimit] = useState(20);
  const handleLimitChange = useCallback(
    (e: any) => setLimit(parseInt(e.target.value)),
    [setLimit],
  );
  const {
    resetElementIndex,
    elementIndex,
    setElementCount,
    setElementIndex,
    activeFinderIds,
    addActiveFinder,
    removeActiveFinder,
  } = useSimilarityFinderState();
  useEffect(() => {
    resetElementIndex();
    addActiveFinder(finderId);
    return () => {
      removeActiveFinder(finderId);
    };
  }, [resetElementIndex, addActiveFinder, removeActiveFinder, finderId]);

  const { t } = useTranslation();
  const handleSearchStringChange = useCallback(
    (value: string) => {
      setSearch(value);
    },
    [setSearch],
  );
  const dataPathSearch = useMemo<string | undefined>(
    () => searchOnDataPath && Resolve.data(data, searchOnDataPath),
    [data, searchOnDataPath],
  );
  const searchString: string | undefined = useMemo<string | null>(
    () => dataPathSearch || globalSearch || search || null,
    [dataPathSearch, search, globalSearch],
  );
  const knowledgeBases = useMemo(
    () =>
      allKnowledgeBases.filter(({ id }) =>
        selectedKnowledgeSources.includes(id),
      ),
    [allKnowledgeBases, selectedKnowledgeSources],
  );

  const [searchResults, setSearchResults] = useState<
    Record<KnowledgeSources, any[]>
  >(
    Object.fromEntries(knowledgeBases.map((kb) => [kb.id, []])) as Record<
      KnowledgeSources,
      any[]
    >,
  );

  const debouncedSearch = React.useRef(debounce(performSearch, 500)).current;

  const doSearch = useCallback(
    (search: string) =>
      debouncedSearch(
        search,
        preselectedClassIRI,
        typeIRIToTypeName(preselectedClassIRI),
        { limit },
        knowledgeBases,
        setSearchResults,
        setElementCount,
      ),
    [
      knowledgeBases,
      preselectedClassIRI,
      limit,
      knowledgeBases,
      setSearchResults,
      setElementCount,
      debouncedSearch,
      typeIRIToTypeName,
    ],
  );

  //const typeName = useMemo(() =>  typeIRIToTypeName(preselectedClassIRI), [typeIRIToTypeName, preselectedClassIRI])
  const [mappingInProgress, setMappingInProgress] = useState(false);

  useEffect(() => {
    debouncedSearch.cancel();
    if (!searchString || searchString.length < 1) return;
    doSearch(searchString);
  }, [searchString, doSearch, debouncedSearch]);

  useEffect(() => {
    if (globalTypeName) setTypeName(globalTypeName);
  }, [globalTypeName, setTypeName]);
  useEffect(() => {
    setTypeName(typeIRIToTypeName(preselectedClassIRI));
  }, [preselectedClassIRI, setTypeName, typeIRIToTypeName]);
  const classIRI = useMemo(
    () => typeNameToTypeIRI(typeName),
    [typeName, typeNameToTypeIRI],
  );

  const { crudOptions } = useGlobalCRUDOptions();
  const { dataStore, ready } = useDataStore({
    schema,
    crudOptionsPartial: crudOptions,
    typeNameToTypeIRI,
    queryBuildOptions,
  });
  const { mapData } = useDeclarativeMapper();
  const handleManuallyMapData = useCallback(
    async (
      id: string | undefined,
      entryData: any,
      source: KnowledgeSources,
    ) => {
      console.log("manually map data", id, entryData, source);
      setMappingInProgress(true);
      if (!id || !entryData?.allProps) return;
      try {
        const knowledgeBase = knowledgeBases.find((kb) => kb.id === source);
        const finalData = await mapData(
          id,
          classIRI,
          entryData,
          knowledgeBase.authorityIRI,
        );
        console.log("finalData", finalData);
        onMappedDataAccepted && onMappedDataAccepted(finalData);
      } catch (e) {
        console.error("could not map from authority", e);
      }
      setMappingInProgress(false);
    },
    [
      mapData,
      classIRI,
      onMappedDataAccepted,
      knowledgeBases,
      setMappingInProgress,
    ],
  );

  const handleEntityChange = useCallback(
    (id: string | undefined, data: any) => {
      onEntityIRIChange && onEntityIRIChange(id);
      onExistingEntityAccepted && onExistingEntityAccepted(id, data);
    },
    [onEntityIRIChange, onExistingEntityAccepted],
  );

  const handleAccept = useCallback(
    (id: string | undefined, entryData: any, source: KnowledgeSources) => {
      if (source === "kb") {
        handleEntityChange(id, entryData);
      } else {
        handleManuallyMapData(id, entryData, source);
      }
    },
    [handleManuallyMapData, handleEntityChange],
  );

  const { cycleThroughElements } = useSimilarityFinderState();
  const handleKeyUp = useCallback(
    (ev: React.KeyboardEvent<HTMLInputElement>) => {
      if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
        cycleThroughElements(ev.key === "ArrowDown" ? 1 : -1);
        ev.preventDefault();
      }
    },
    [cycleThroughElements],
  );
  const [margin, setMargin] = useState(0);
  const [ref, setRef] = useState<any | undefined>();
  useEffect(() => {
    if (ref) {
      setMargin(ref.clientHeight);
    }
  }, [ref]);
  const { registerModal, modalRegistry } = useModalRegistry(NiceModal);

  const getDefaultLabelKey = useCallback(
    (typeIRI?: string) => {
      const fieldDefinitions = primaryFields[typeName] as
        | PrimaryField
        | undefined;
      return fieldDefinitions?.label || "title";
    },
    [primaryFields, typeName],
  );

  const showEditDialog = useCallback(() => {
    const defaultLabelKey = getDefaultLabelKey(preselectedClassIRI);
    const newItem = {
      "@id": createEntityIRI(preselectedClassIRI),
      "@type": preselectedClassIRI,
      [defaultLabelKey]: searchString,
    };
    const modalID = `edit-${newItem["@type"]}-${newItem["@id"]}`;
    registerModal(modalID, EditEntityModal);
    NiceModal.show(modalID, {
      entityIRI: newItem["@id"],
      typeIRI: newItem["@type"],
      data: newItem,
      disableLoad: true,
    }).then(({ entityIRI, data }: { entityIRI: string; data: any }) => {
      handleEntityChange(entityIRI, data);
    });
  }, [
    registerModal,
    preselectedClassIRI,
    searchString,
    handleEntityChange,
    typeIRIToTypeName,
    createEntityIRI,
    getDefaultLabelKey,
    EditEntityModal,
  ]);

  /**
   * in order to give each element an index across all knowledge sources we need to
   * merge the results and add an index to each element
   * */
  const resultsWithIndex = useMemo(() => {
    let idx = 0;
    const intermediate = Object.entries(searchResults).reduce(
      (acc, [key, value]) => [
        ...acc,
        ...value.map((entry) => {
          idx++;
          return { entry, idx, key };
        }),
      ],
      [],
    );
    return Object.fromEntries(
      Object.keys(searchResults).map((kb) => [
        kb,
        intermediate.filter(({ key }) => key === kb),
      ]),
    );
  }, [searchResults]);

  const finderIsActive = useMemo(
    () =>
      activeFinderIds.includes(finderId) &&
      activeFinderIds[activeFinderIds.length - 1] === finderId,
    [activeFinderIds, finderId],
  );

  const handleSelectEntity = useCallback(
    (id: string, index: number, kb: KnowledgeBaseDescription) => {
      setElementIndex(index);
      if (onSelectedEntityChange) {
        onSelectedEntityChange(id, kb.authorityIRI);
      }
    },
    [setElementIndex, onSelectedEntityChange],
  );

  return (
    finderIsActive && (
      <div style={{ overflow: "hidden", position: "relative" }}>
        {mappingInProgress ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </div>
        ) : null}
        <div
          style={{
            filter: mappingInProgress ? "grayscale(100%)" : "none",
            pointerEvents: mappingInProgress ? "none" : "auto",
          }}
        >
          <Grid
            container
            alignItems="center"
            direction={"column"}
            spacing={2}
            style={{ overflowY: "auto", marginBottom: margin }}
          >
            <Grid item sx={{ width: "100%" }}>
              <SearchFieldWithBadges
                disabled={Boolean(dataPathSearch)}
                searchString={searchString || ""}
                typeIRI={classIRI}
                onSearchStringChange={handleSearchStringChange}
                selectedKnowledgeSources={selectedKnowledgeSources}
                knowledgeBases={knowledgeBases}
                onKeyUp={handleKeyUp}
                advancedConfigChildren={
                  <NumberInput
                    style={{ maxWidth: "4em" }}
                    value={limit}
                    onChange={handleLimitChange}
                    min={1}
                    max={100}
                    step={1}
                    title={t("limit")}
                  />
                }
              />
            </Grid>
            <Grid
              item
              sx={{
                width: "100%",
                height: `calc(100vh - 150px)`,
                display: "flex",
                flexDirection: "column" /* flexWrap: 'wrap'*/,
              }}
            >
              {knowledgeBases.map((kb) => {
                const entries = resultsWithIndex[kb.id] || [];
                return (
                  <ClassicResultListWrapper
                    key={kb.id}
                    label={kb.label}
                    hitCount={entries.length}
                  >
                    {searchString && (
                      <List>
                        {entries.map(({ entry, idx }) =>
                          kb.listItemRenderer(
                            entry,
                            idx,
                            classIRI,
                            elementIndex === idx,
                            (id, index) => handleSelectEntity(id, index, kb),
                            (id, data) => handleAccept(id, data, kb.id),
                          ),
                        )}
                      </List>
                    )}
                  </ClassicResultListWrapper>
                );
              })}
              {Array.from(modalRegistry)
                .map((modal) => modal)
                .join(",")}
            </Grid>
          </Grid>
          <Hidden xsUp={hideFooter}>
            <Grid
              container
              ref={setRef}
              alignItems="center"
              justifyContent="center"
              direction={"column"}
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                left: 0,
                backgroundColor: "white",
              }}
            >
              <Button
                variant="contained"
                color={"primary"}
                startIcon={<NoteAdd />}
                onClick={showEditDialog}
              >
                {t("create new", { item: t(typeName) })}
              </Button>
            </Grid>
          </Hidden>
        </div>
      </div>
    )
  );
};
