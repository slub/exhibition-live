import { Resolve } from "@jsonforms/core";
import {
  Check,
  NoteAdd,
  Storage as KnowledgebaseIcon,
} from "@mui/icons-material";
import {
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  Hidden,
  IconButton,
  List,
  Stack,
  TextField,
  TextFieldProps,
} from "@mui/material";
import ClassicResultListWrapper from "./result/ClassicResultListWrapper";
import { JSONSchema7 } from "json-schema";
import * as React from "react";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";

import { declarativeMappings } from "../config/lobidMappings";
import { useSettings } from "../state/useLocalSettings";
import { Img } from "../utils/image/Img";
import { mapByConfig } from "../utils/mapping/mapByConfig";
import {
  DeclarativeMapping,
  StrategyContext,
} from "../utils/mapping/mappingStrategies";
import { defaultPrefix, sladb, slent } from "./formConfigs";
import {
  gndEntryFromSuggestion,
  gndEntryWithMainInfo,
} from "./lobid/LobidSearchTable";
import { findEntityByAuthorityIRI, findEntityByClass } from "../utils/discover";
import { useGlobalCRUDOptions } from "../state/useGlobalCRUDOptions";
import { mapAbstractDataUsingAI, mapDataUsingAI } from "../utils/ai";
import {
  useGlobalSearch,
  useLoadQuery,
  useModalRegistry,
  useSimilarityFinderState,
} from "../state";
import { useTranslation } from "next-i18next";
import { searchEntityByLabel } from "../utils/discover/searchEntityByLabel";
import { primaryFields, typeIRItoTypeName } from "../config";
import NiceModal from "@ebay/nice-modal-react";
import { EditEntityModal } from "./edit/EditEntityModal";
import { PrimaryField } from "../utils/types";
import ClassicResultListItem from "./result/ClassicResultListItem";
import { EntityDetailElement } from "./show";
import {
  findEntityWithinLobid,
  findEntityWithinLobidByIRI,
} from "../utils/lobid/findEntityWithinLobid";
import LobidAllPropTable from "./lobid/LobidAllPropTable";
import WikidataAllPropTable from "./wikidata/WikidataAllPropTable";
import ClassicEntityCard from "./lobid/ClassicEntityCard";
import { debounce } from "lodash";
import { filterUndefOrNull } from "@slub/edb-core-utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useExtendedSchema from "../state/useExtendedSchema";
import { BasicThingInformation } from "@slub/edb-core-types";
import { NumberInput } from "./NumberInput";

// @ts-ignore
type Props = {
  finderId: string;
  data: any;
  classIRI: string;
  jsonSchema: JSONSchema7;
  onEntityIRIChange?: (entityIRI: string | undefined) => void;
  onMappedDataAccepted?: (data: any) => void;
  onExistingEntityAccepted?: (entityIRI: string, data: any) => void;
  searchOnDataPath?: string;
  search?: string;
  hideFooter?: boolean;
};

type KnowledgeSources = "kb" | "gnd" | "wikidata" | "k10plus" | "ai";
type SelectedEntity = {
  id: string;
  source: KnowledgeSources;
};
const getDefaultLabelKey = (typeIRI?: string) => {
  const typeName = typeIRItoTypeName(typeIRI);
  const fieldDefinitions = primaryFields[typeName] as PrimaryField | undefined;
  return fieldDefinitions?.label || "title";
};

export const makeDefaultMappingStrategyContext: (
  doQuery: (query) => Promise<any>,
  mappingTable?: DeclarativeMapping,
) => StrategyContext = (doQuery, mappingTable) => ({
  mappingTable,
  getPrimaryIRIBySecondaryIRI: async (
    secondaryIRI: string,
    authorityIRI: string,
    typeIRI?: string | undefined,
  ) => {
    const ids = await findEntityByAuthorityIRI(secondaryIRI, typeIRI, doQuery);
    if (ids.length > 0) {
      console.warn("found more then one entity");
    }
    return ids[0] || null;
  },
  searchEntityByLabel: async (
    label: string,
    typeIRI: string,
  ): Promise<string> => {
    const ids = await searchEntityByLabel(label, typeIRI, doQuery);
    if (ids.length > 0) {
      console.warn("found more then one entity");
    }
    return ids[0] || null;
  },
  authorityIRI: "http://d-nb.info/gnd",
  newIRI: (typeIRI: string) => {
    return slent(uuidv4()).value;
  },
});

type FindOptions = {
  limit?: number;
  page?: number;
  offset?: number;
  pageSize?: number;
};

type KnowledgeBaseDescription = {
  id: KnowledgeSources;
  authorityIRI?: string;
  label: string;
  description: string;
  icon: string | React.ReactNode;
  find: (
    searchString: string,
    typeIRI: string,
    findOptions?: FindOptions,
  ) => Promise<BasicThingInformation[]>;
  detailRenderer?: (id: string) => React.ReactNode;
  listItemRenderer?: (
    entry: any,
    idx: number,
    typeIRI: string,
    selected: boolean,
    onSelect?: (id: string, index: number) => void,
    onAccept?: (id: string, entry: any) => void,
  ) => React.ReactNode;
};

const SearchFieldWithBadges = ({
  searchString,
  typeIRI,
  onSearchStringChange,
  selectedKnowledgeSources,
  toggleKnowledgeSource,
  knowledgeBases,
  advancedConfigChildren,
  ...rest
}: {
  searchString: string;
  typeIRI: string;
  onSearchStringChange: (value: string) => void;
  knowledgeBases: KnowledgeBaseDescription[];
  selectedKnowledgeSources: string[];
  toggleKnowledgeSource?: (source: string) => void;
  advancedConfigChildren?: React.ReactNode;
} & Partial<TextFieldProps>) => {
  const typeName = useMemo(() => typeIRItoTypeName(typeIRI), [typeIRI]);
  const { t } = useTranslation();
  return (
    <Grid
      container
      spacing={2}
      sx={{
        m: 2,
        px: 2,
        py: 1,
        width: "auto",
        border: 1,
        borderColor: "primary.main",
        borderRadius: "4px",
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <TextField
          variant={"standard"}
          fullWidth={true}
          value={searchString || ""}
          onChange={(e) => onSearchStringChange(e.currentTarget.value)}
          label={`Suche in ${selectedKnowledgeSources.join(",")} nach ${t(
            typeName,
          )} `}
          {...rest}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        {knowledgeBases.map(({ id, label, icon }) => {
          return (
            <Badge
              key={id}
              color="primary"
              sx={{ m: 0.5 }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              variant="dot"
              overlap="circular"
              invisible={!selectedKnowledgeSources?.includes(id)}
            >
              {icon}
            </Badge>
          );
        })}
        {advancedConfigChildren && (
          <>
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            {advancedConfigChildren}
          </>
        )}
      </Box>
    </Grid>
  );
};

type ListItemRendererProps = {
  data: BasicThingInformation;
  idx: number;
  typeIRI: string;
  selected: boolean;
  onSelect?: (id: string, index: number) => void;
  onAccept?: (id: string, data: any) => void;
};

const fetchBasicInformationFromGND: (
  id: string,
  initialData: BasicThingInformation,
) => Promise<BasicThingInformation> = async (
  id: string,
  initialData: BasicThingInformation,
) => {
  const rawEntry = await findEntityWithinLobidByIRI(id);
  const { category, secondary, avatar } = initialData;
  return {
    category,
    avatar,
    ...gndEntryWithMainInfo(rawEntry),
    secondary: initialData.secondary,
  };
};

const GNDListItemRenderer = ({
  data: initialData,
  idx,
  typeIRI,
  selected,
  onSelect,
  onAccept,
}: ListItemRendererProps) => {
  const { t } = useTranslation();
  const { id } = initialData;
  const queryClient = useQueryClient();
  const { data } = useQuery<BasicThingInformation>(
    ["entityDetail", id],
    async () => fetchBasicInformationFromGND(id, initialData),
    {
      initialData,
      enabled: selected,
    },
  );

  const { resetElementIndex } = useSimilarityFinderState();

  const handleAccept = useCallback(async () => {
    const finalData = await queryClient.fetchQuery(
      ["entityDetail", id],
      async () => fetchBasicInformationFromGND(id, initialData),
    );
    resetElementIndex();
    onAccept && onAccept(id, finalData);
  }, [onAccept, id, queryClient, initialData, resetElementIndex]);

  const { acceptWishPending, setAcceptWishPending } =
    useSimilarityFinderState();
  useEffect(() => {
    if (selected && handleAccept && acceptWishPending) {
      setAcceptWishPending(false);
      handleAccept();
    }
  }, [handleAccept, selected, acceptWishPending, setAcceptWishPending]);

  const { label, avatar, secondary, category } = data;
  return (
    <ClassicResultListItem
      key={id}
      id={id}
      index={idx}
      onSelected={onSelect}
      label={label}
      secondary={secondary}
      avatar={avatar}
      altAvatar={String(idx)}
      selected={selected}
      onEnter={handleAccept}
      category={category}
      listItemProps={{
        secondaryAction: (
          <Stack direction="row" spacing={1}>
            <IconButton onClick={handleAccept}>
              <Check />
            </IconButton>
          </Stack>
        ),
      }}
      popperChildren={
        <ClassicEntityCard
          sx={{
            maxWidth: "30em",
            maxHeight: "80vh",
            overflow: "auto",
          }}
          id={id}
          data={data}
          cardActionChildren={
            <Button
              size="small"
              color="primary"
              variant="contained"
              onClick={handleAccept}
            >
              {t("accept entity")}
            </Button>
          }
          detailView={
            <>
              <LobidAllPropTable allProps={data.allProps} disableContextMenu />
              {(data.allProps?.sameAs || [])
                .filter(({ id }) =>
                  id.startsWith("http://www.wikidata.org/entity/"),
                )
                .map(({ id }) => (
                  <WikidataAllPropTable key={id} thingIRI={id} />
                ))}
            </>
          }
        />
      }
    />
  );
};

const KBListItemRenderer = ({
  data,
  idx,
  typeIRI,
  selected,
  onSelect,
  onAccept,
}: ListItemRendererProps) => {
  const { id, label, avatar, secondary } = data;

  const typeName = useMemo(() => typeIRItoTypeName(typeIRI), [typeIRI]);
  const loadedSchema = useExtendedSchema({ typeName, classIRI: typeIRI });
  const loadEntity = useLoadQuery(defaultPrefix, "load");
  const { resetElementIndex } = useSimilarityFinderState();
  const handleAccept = useCallback(async () => {
    const finalData = (await loadEntity(id, typeIRI, loadedSchema))?.document;
    if (!finalData) {
      console.warn("could not load entity");
      return;
    }
    resetElementIndex();
    onAccept && onAccept(id, finalData);
  }, [onAccept, id, loadEntity, typeIRI, loadedSchema, resetElementIndex]);
  const { acceptWishPending, setAcceptWishPending } =
    useSimilarityFinderState();
  useEffect(() => {
    if (selected && handleAccept && acceptWishPending) {
      setAcceptWishPending(false);
      handleAccept();
    }
  }, [handleAccept, selected, acceptWishPending, setAcceptWishPending]);

  return (
    <ClassicResultListItem
      key={id}
      id={id}
      index={idx}
      onSelected={onSelect}
      label={label}
      secondary={secondary}
      avatar={avatar}
      altAvatar={String(idx)}
      selected={selected}
      onEnter={handleAccept}
      listItemProps={{
        secondaryAction: (
          <Stack direction="row" spacing={1}>
            <IconButton onClick={handleAccept}>
              <Check />
            </IconButton>
          </Stack>
        ),
      }}
      popperChildren={
        <EntityDetailElement
          sx={{
            maxWidth: "30em",
            maxHeight: "80vh",
            overflow: "auto",
          }}
          entityIRI={id}
          typeIRI={typeIRI}
          data={undefined}
          cardActionChildren={null}
          readonly
        />
      }
    />
  );
};
const useKnowledgeBases = () => {
  const { crudOptions } = useGlobalCRUDOptions();
  const kbs: KnowledgeBaseDescription[] = useMemo(
    () => [
      {
        id: "kb",
        label: "Lokale Datenbank",
        description: "Datenbank der Ausstellung",
        icon: <KnowledgebaseIcon />,
        find: async (
          searchString: string,
          typeIRI,
          findOptions?: FindOptions,
        ) => {
          return (
            await findEntityByClass(
              searchString,
              typeIRI,
              crudOptions.selectFetch,
              findOptions?.limit || 10,
            )
          ).map(
            ({
              name = "",
              value,
              image,
              description,
            }: {
              name: string;
              value: string;
              image: string;
              description: string;
            }) => {
              return {
                label: name,
                id: value,
                avatar: image,
                secondary: description,
              };
            },
          );
        },
        listItemRenderer: (
          entry: any,
          idx: number,
          typeIRI: string,
          selected,
          onSelect,
          onAccept,
        ) => (
          <KBListItemRenderer
            data={entry}
            idx={idx}
            typeIRI={typeIRI}
            selected={selected}
            onSelect={onSelect}
            onAccept={onAccept}
          />
        ),
      },
      {
        id: "gnd",
        authorityIRI: "http://d-nb.info/gnd",
        label: "GND",
        description: "Gemeinsame Normdatei",
        icon: (
          <Img
            alt={"gnd logo"}
            width={24}
            height={24}
            src={"Icons/gnd-logo.png"}
          />
        ),
        find: async (
          searchString: string,
          typeIRI,
          findOptions?: FindOptions,
        ) => {
          return filterUndefOrNull(
            await findEntityWithinLobid(
              searchString,
              typeIRItoTypeName(typeIRI),
              findOptions?.limit || 10,
              "json:suggest",
            ),
          )?.map((allProps: any) => gndEntryFromSuggestion(allProps));
        },
        listItemRenderer: (
          data: any,
          idx: number,
          typeIRI: string,
          selected,
          onSelect,
          onAccept,
        ) => (
          <GNDListItemRenderer
            data={data}
            idx={idx}
            typeIRI={typeIRI}
            selected={selected}
            onSelect={onSelect}
            onAccept={onAccept}
          />
        ),
      },
    ],
    [crudOptions?.selectFetch],
  );
  return kbs;
};

const SimilarityFinder: FunctionComponent<Props> = ({
  finderId,
  data,
  classIRI: preselectedClassIRI,
  onEntityIRIChange,
  onExistingEntityAccepted,
  onMappedDataAccepted,
  searchOnDataPath,
  search,
  jsonSchema,
  hideFooter,
}) => {
  const { openai } = useSettings();
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<
    KnowledgeSources[]
  >(["kb", "gnd"]);

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
  const knowledgeBases: KnowledgeBaseDescription[] = useKnowledgeBases();

  const [searchResults, setSearchResults] = useState<
    Record<KnowledgeSources, any[]>
  >(
    Object.fromEntries(knowledgeBases.map((kb) => [kb.id, []])) as Record<
      KnowledgeSources,
      any[]
    >,
  );

  /* eslint-disable react-hooks/exhaustive-deps */
  const searchAll = useCallback(
    debounce(
      (searchString: string, typeIRI: string, findOptions?: FindOptions) => {
        return Promise.all(
          knowledgeBases.map(async (kb) => {
            return {
              [kb.id]: selectedKnowledgeSources.includes(kb.id)
                ? await kb.find(searchString, typeIRI, findOptions)
                : [],
            };
          }),
        ).then((results) => {
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
      },
      500,
    ),
    [
      knowledgeBases,
      selectedKnowledgeSources,
      setSearchResults,
      setElementCount,
    ],
  );

  useEffect(() => {
    if (!searchString || searchString.length < 1) return;
    searchAll(searchString, preselectedClassIRI, { limit });
  }, [searchString, preselectedClassIRI, searchAll, limit]);

  const [typeName, setTypeName] = useState(
    typeIRItoTypeName(preselectedClassIRI),
  );
  useEffect(() => {
    if (globalTypeName) setTypeName(globalTypeName);
  }, [globalTypeName, setTypeName]);
  const classIRI = useMemo(() => sladb(typeName).value, [typeName]);
  useEffect(() => {
    setTypeName(typeIRItoTypeName(preselectedClassIRI));
  }, [preselectedClassIRI, setTypeName]);

  const handleToggle = useCallback(
    (id: string | undefined, source: KnowledgeSources) => {
      !selectedKnowledgeSources?.includes(source)
        ? setSelectedKnowledgeSources(
            (before) => [...before, source] as KnowledgeSources[],
          )
        : setSelectedKnowledgeSources(
            (before) => before.filter((s) => s != source) as KnowledgeSources[],
          );
    },
    [setSelectedKnowledgeSources, selectedKnowledgeSources],
  );
  const handleMapAbstractAndDescUsingAI = useCallback(
    async (id: string | undefined, entryData: any) => {
      const newData = mapAbstractDataUsingAI(id, typeName, entryData, {
        jsonSchema,
        openai,
      });
      onMappedDataAccepted && onMappedDataAccepted(newData);
    },
    [typeName, onMappedDataAccepted, jsonSchema, openai],
  );
  const handleMapUsingAI = useCallback(
    async (id: string | undefined, entryData: any) => {
      const newData = await mapDataUsingAI(id, typeName, entryData, {
        jsonSchema,
        openai,
      });
      onMappedDataAccepted && onMappedDataAccepted(newData);
    },
    [typeName, onMappedDataAccepted, jsonSchema, openai],
  );
  const { crudOptions } = useGlobalCRUDOptions();
  const handleManuallyMapData = useCallback(
    async (
      id: string | undefined,
      entryData: any,
      source: KnowledgeSources,
    ) => {
      if (!id || !entryData?.allProps) return;
      const knowledgeBaseDescription = knowledgeBases.find(
        (kb) => kb.id === source,
      );
      const mappingConfig = declarativeMappings[typeName];
      if (!mappingConfig) {
        console.warn(`no mapping config for ${typeName}`);
        return;
      }
      try {
        const mappingContext = makeDefaultMappingStrategyContext(
          crudOptions?.selectFetch,
          declarativeMappings,
        );
        const existingEntry = await mappingContext.getPrimaryIRIBySecondaryIRI(
          id,
          knowledgeBaseDescription?.authorityIRI || "urn:local",
          classIRI,
        );
        const dataFromGND = await mapByConfig(
          entryData.allProps,
          {},
          mappingConfig,
          mappingContext,
        );
        if (existingEntry) {
          onEntityIRIChange && onEntityIRIChange(existingEntry);
          onExistingEntityAccepted &&
            onExistingEntityAccepted(existingEntry, dataFromGND);
          return;
        }

        const inject = {
          "@type": classIRI,
          idAuthority: {
            "@id": id,
          },
          lastNormUpdate: new Date().toISOString(),
        };
        onMappedDataAccepted &&
          onMappedDataAccepted({ ...dataFromGND, ...inject });
      } catch (e) {
        console.error("could not map from authority", e);
      }
    },
    [
      classIRI,
      typeName,
      onMappedDataAccepted,
      onExistingEntityAccepted,
      onEntityIRIChange,
      crudOptions?.selectFetch,
      knowledgeBases,
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
        if (selectedKnowledgeSources?.includes("ai")) {
          handleMapUsingAI(id, entryData);
        } else {
          handleManuallyMapData(id, entryData, source);
        }
      }
    },
    [
      handleManuallyMapData,
      handleMapUsingAI,
      handleEntityChange,
      selectedKnowledgeSources,
    ],
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
  const { registerModal } = useModalRegistry();

  const showEditDialog = useCallback(() => {
    const defaultLabelKey = getDefaultLabelKey(preselectedClassIRI);
    const newItem = {
      "@id": slent(uuidv4()).value,
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
    }).then(({ entityIRI, data }) => {
      handleEntityChange(entityIRI, data);
    });
  }, [registerModal, preselectedClassIRI, searchString, handleEntityChange]);

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

  return (
    finderIsActive && (
      <div style={{ overflow: "hidden" }}>
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
                  selected={selectedKnowledgeSources?.includes(kb.id)}
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
                          () => setElementIndex(idx),
                          (id, data) => handleAccept(id, data, kb.id),
                        ),
                      )}
                    </List>
                  )}
                </ClassicResultListWrapper>
              );
            })}
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
    )
  );
};

export default SimilarityFinder;
