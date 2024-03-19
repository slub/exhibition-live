import {Resolve} from "@jsonforms/core";
import {NoteAdd, Storage as KnowledgebaseIcon} from "@mui/icons-material";
import {Badge, Box, Button, Divider, Grid, List, TextField, TextFieldProps} from "@mui/material";
import ClassicResultListWrapper from "./result/ClassicResultListWrapper";
import {JSONSchema7} from "json-schema";
import * as React from "react";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {v4 as uuidv4} from "uuid";

import {declarativeMappings} from "../config/lobidMappings";
import {useSettings} from "../state/useLocalSettings";
import {Img} from "../utils/image/Img";
import {mapByConfig} from "../utils/mapping/mapByConfig";
import {
  DeclarativeMapping,
  StrategyContext,
} from "../utils/mapping/mappingStrategies";
import {sladb, slent} from "./formConfigs";
import {gndEntryWithMainInfo} from "./lobid/LobidSearchTable";
import {findEntityByAuthorityIRI, findEntityByClass} from "../utils/discover";
import {useGlobalCRUDOptions} from "../state/useGlobalCRUDOptions";
import {mapAbstractDataUsingAI, mapDataUsingAI} from "../utils/ai";
import {useGlobalSearch, useSimilarityFinderState} from "../state";
import {useTranslation} from "next-i18next";
import {searchEntityByLabel} from "../utils/discover/searchEntityByLabel";
import {primaryFields, typeIRItoTypeName} from "../config";
import NiceModal from "@ebay/nice-modal-react";
import {EditEntityModal} from "./edit/EditEntityModal";
import {PrimaryField} from "../utils/types";
import ClassicResultListItem from "./result/ClassicResultListItem";
import {EntityDetailElement} from "./show";
import {findEntityWithinLobid} from "../utils/lobid/findEntityWithinLobid";
import LobidAllPropTable from "./lobid/LobidAllPropTable";
import WikidataAllPropTable from "./wikidata/WikidataAllPropTable";
import ClassicEntityCard from "./lobid/ClassicEntityCard";
import {debounce} from "lodash";

// @ts-ignore
type Props = {
  data: any;
  classIRI: string;
  jsonSchema: JSONSchema7;
  onEntityIRIChange?: (entityIRI: string | undefined) => void;
  onMappedDataAccepted?: (data: any) => void;
  onExistingEntityAccepted?: (entityIRI: string, data: any) => void;
  searchOnDataPath?: string;
  search?: string;
};
type State = {};

type KnowledgeSources = "kb" | "gnd" | "wikidata" | "k10plus" | "ai";
type SelectedEntity = {
  id: string;
  source: KnowledgeSources;
};
const getDefaultLabelKey = (typeIRI?: string) => {
  const typeName = typeIRItoTypeName(typeIRI)
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
}

type KnowledgeBaseDescription = {
  id: KnowledgeSources;
  authorityIRI?: string;
  label: string;
  description: string;
  icon: string | React.ReactNode;
  find: (searchString: string, typeIRI: string, findOptions?: FindOptions) => Promise<any[]>;
  detailRenderer?: (id: string) => React.ReactNode;
  listItemRenderer?: (entry: any, idx: number, typeIRI: string, selected: boolean, onSelect?: () => void) => React.ReactNode;

}

const SearchFieldWithBadges = ({
                                 searchString,
                                 typeIRI,
                                 onSearchStringChange,
                                 selectedKnowledgeSources,
                                 toggleKnowledgeSource,
                                 knowledgeBases,
                                 ...rest
                               }: {
  searchString: string,
  typeIRI: string,
  onSearchStringChange: (value: string) => void,
  knowledgeBases: KnowledgeBaseDescription[],
  selectedKnowledgeSources: string[],
  toggleKnowledgeSource?: (source: string) => void
} & Partial<TextFieldProps>) => {
  const typeName = useMemo(() => typeIRItoTypeName(typeIRI), [typeIRI])
  const {t} = useTranslation()
  return <Grid
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
    <Box sx={{flexGrow: 1}}>
      <TextField
        variant={"standard"}
        fullWidth={true}
        value={searchString || ""}
        onChange={(e) =>
          onSearchStringChange(e.currentTarget.value)
        }
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
      <Divider sx={{height: 28, m: 0.5}} orientation="vertical"/>
      {
        knowledgeBases.map(({id, label, icon}) => {
          return <Badge
            key={id}
            color="primary"
            sx={{m: 0.5}}
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
        })
      }
    </Box>
  </Grid>
}

const useKnowledgeBases = () => {
  const {crudOptions} = useGlobalCRUDOptions();
  const kbs: KnowledgeBaseDescription[] = useMemo(() => [
    {
      id: "kb",
      label: "Lokale Datenbank",
      description: "Datenbank der Ausstellung",
      icon: <KnowledgebaseIcon/>,
      find: async (searchString: string, typeIRI, findOptions?: FindOptions) => {
        return (await findEntityByClass(searchString, typeIRI, crudOptions.selectFetch, findOptions?.limit || 10))
          .map(({name = "", value}: { name: string; value: string }) => {
            return {
              label: name,
              id: value,
            };
          })
      },
      listItemRenderer: (entry: any, idx: number, typeIRI: string, selected, onSelect) => {
        const {id, label, avatar, secondary} = entry;
        return <ClassicResultListItem
          key={id}
          id={id}
          index={idx}
          onSelected={onSelect}
          label={label}
          secondary={secondary}
          avatar={avatar}
          altAvatar={String(idx + 1)}
          selected={selected}
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
            />
          }
        />
      }

    }, {
      id: "gnd",
      authorityIRI: "http://d-nb.info/gnd",
      label: "GND",
      description: "Gemeinsame Normdatei",
      icon: <Img
        alt={"gnd logo"}
        width={24}
        height={24}
        src={"/Icons/gnd-logo.png"}
      />,
      find: async (searchString: string, typeIRI, findOptions?: FindOptions) => {
        return (await findEntityWithinLobid(searchString, typeIRItoTypeName(typeIRI), findOptions?.limit || 10))?.member?.map(
          (allProps: any) => gndEntryWithMainInfo(allProps),
        )
      },
      listItemRenderer: (data: any, idx: number, typeIRI: string, selected, onSelect) => {
        const {id, label, avatar, secondary} = data;
        return <ClassicResultListItem
          key={id}
          id={id}
          index={idx}
          onSelected={onSelect}
          label={label}
          secondary={secondary}
          avatar={avatar}
          altAvatar={String(idx + 1)}
          selected={selected}
          popperChildren={
            <ClassicEntityCard
              sx={{
                maxWidth: "30em",
                maxHeight: "80vh",
                overflow: "auto",
              }}
              id={id}
              data={data}
              onSelectItem={onSelect}
              acceptTitle={"Eintrag übernehmen"}
              detailView={
                <>
                  <LobidAllPropTable
                    allProps={data.allProps}
                    onEntityChange={onSelect}
                  />
                  {(data.allProps?.sameAs || [])
                    .filter(({id}) =>
                      id.startsWith("http://www.wikidata.org/entity/"),
                    )
                    .map(({id}) => (
                      <WikidataAllPropTable key={id} thingIRI={id}/>
                    ))}
                </>
              }
            />
          }
        />
      }
    }
  ], [crudOptions?.selectFetch])
  return kbs
}


const SimilarityFinder: FunctionComponent<Props> = ({
                                                      data,
                                                      classIRI: preselectedClassIRI,
                                                      onEntityIRIChange,
                                                      onExistingEntityAccepted,
                                                      onMappedDataAccepted,
                                                      searchOnDataPath,
                                                      search,
                                                      jsonSchema,
                                                    }) => {
  const {openai} = useSettings();
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<
    KnowledgeSources[]
  >(["kb", "gnd"]);
  const [entitySelected, setEntitySelected] = useState<
    SelectedEntity | undefined
  >();

  const {
    search: globalSearch,
    typeName: globalTypeName,
    path: globalPath,
    setSearch,
  } = useGlobalSearch();

  const {resetElementIndex, elementIndex, setElementCount} = useSimilarityFinderState();
  useEffect(() => {
    resetElementIndex();
  }, [resetElementIndex]);

  const {t} = useTranslation();
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

  const [searchResults, setSearchResults] = useState<Record<KnowledgeSources, any[]>>(
    Object.fromEntries(knowledgeBases.map(kb => [kb.id, []])) as Record<KnowledgeSources, any[]>
  )

  /* eslint-disable react-hooks/exhaustive-deps */
  const searchAll = useCallback(debounce((searchString: string, typeIRI: string, findOptions?: FindOptions) => {
      return Promise.all(knowledgeBases.map(async (kb) => {
        return {
          [kb.id]: selectedKnowledgeSources.includes(kb.id) ? await kb.find(searchString, typeIRI, findOptions) : []
        }
      })).then((results) => {
        const searchResults = (Object.assign({}, ...results)) as Record<KnowledgeSources, any[]>
        setSearchResults(searchResults)
        const resultCount = Object.values(searchResults).reduce((acc, list = []) => acc + list.length, 0)
        setElementCount(resultCount)
      })
    }, 500)
    , [knowledgeBases, selectedKnowledgeSources, setSearchResults, setElementCount])

  useEffect(() => {
    if (!searchString || searchString.length < 1) return;
    searchAll(searchString, preselectedClassIRI, {limit: 10})
  }, [searchString, preselectedClassIRI, searchAll]);


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
      setEntitySelected(id ? {id, source} : undefined);
    },
    [setEntitySelected, setSelectedKnowledgeSources, selectedKnowledgeSources],
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
  const handleSelect = useCallback(
    (id: string | undefined, source: KnowledgeSources) => {
      !selectedKnowledgeSources?.includes(source) &&
      setSelectedKnowledgeSources(
        (before) => [...before, source] as KnowledgeSources[],
      );
      setEntitySelected(id ? {id, source} : undefined);
    },
    [setEntitySelected, setSelectedKnowledgeSources, selectedKnowledgeSources],
  );

  const {crudOptions} = useGlobalCRUDOptions();
  const handleManuallyMapData = useCallback(
    async (id: string | undefined, entryData: any, source: KnowledgeSources) => {
      if (!id || !entryData?.allProps) return;
      const knowledgeBaseDescription = knowledgeBases.find(kb => kb.id === source)
      const mappingConfig = declarativeMappings[typeName];
      if (!mappingConfig) {
        console.warn(`no mapping config for ${typeName}`);
        return;
      }
      try {
        const mappingContext = makeDefaultMappingStrategyContext(
              crudOptions?.selectFetch,
              declarativeMappings,
            )
        const existingEntry = await mappingContext.getPrimaryIRIBySecondaryIRI(id, knowledgeBaseDescription?.authorityIRI || "urn:local", classIRI)
        const dataFromGND = await mapByConfig(
          entryData.allProps,
          {},
          mappingConfig,
          mappingContext,
        );
        if(existingEntry) {
          onEntityIRIChange && onEntityIRIChange(existingEntry);
          onExistingEntityAccepted && onExistingEntityAccepted(existingEntry, dataFromGND);
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
        onMappedDataAccepted({...dataFromGND, ...inject});
      } catch (e) {
        console.error("could not map from authority", e);
      }
    },
    [classIRI, typeName, onMappedDataAccepted, onExistingEntityAccepted, onEntityIRIChange, crudOptions?.selectFetch, knowledgeBases],
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
      if(source === "kb") {
        handleEntityChange(id, entryData);
      } else {
        if (selectedKnowledgeSources?.includes("ai")) {
          handleMapUsingAI(id, entryData);
        } else {
          handleManuallyMapData(id, entryData, source);
        }
      }
    },
    [handleManuallyMapData, handleMapUsingAI, handleEntityChange, selectedKnowledgeSources],
  );


  const {cycleThroughElements} = useSimilarityFinderState();
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
  const [ref, setRef] = useState<any | undefined>()
  useEffect(() => {
    if (ref) {
      setMargin(ref.clientHeight);
    }
  }, [ref]);

  const showEditDialog = useCallback(() => {
    const defaultLabelKey = getDefaultLabelKey(preselectedClassIRI);
    const newItem = {
      "@id": slent(uuidv4()).value,
      "@type": preselectedClassIRI,
      [defaultLabelKey]: searchString,
    }
    NiceModal.show(EditEntityModal, {
      entityIRI: newItem["@id"],
      typeIRI: newItem["@type"],
      data: newItem,
      disableLoad: true
    }).then(({entityIRI, data}) => {
      handleEntityChange(entityIRI, data)
    })
  }, [preselectedClassIRI, handleEntityChange, searchString])

  const ResultList = useCallback(
    () => {
      let idx = 0;
      // @ts-ignore
      return knowledgeBases.map((kb) => {
        const entries = searchResults[kb.id] || []
        return <ClassicResultListWrapper
          key={kb.id}
          label={kb.label}
          selected={selectedKnowledgeSources?.includes(kb.id)}
        >
          {searchString && (
            <List>
              {entries.map((entry) => {
                idx++;
                return kb.listItemRenderer(entry, idx, classIRI, elementIndex === idx, () => handleAccept(entry.id, entry, kb.id))
              })}
            </List>
          )}
        </ClassicResultListWrapper>

      })}
  , [searchResults, knowledgeBases, selectedKnowledgeSources, classIRI, handleAccept, elementIndex])

  return <div style={{overflow: 'hidden'}}>

    <Grid container alignItems="center" direction={"column"} spacing={2}
          style={{overflowY: "auto", marginBottom: margin}}>
      <Grid item sx={{width: "100%"}}>
        <SearchFieldWithBadges
          disabled={Boolean(dataPathSearch)}
          searchString={searchString || ""}
          typeIRI={classIRI}
          onSearchStringChange={handleSearchStringChange}
          selectedKnowledgeSources={selectedKnowledgeSources}
          knowledgeBases={knowledgeBases}
          onKeyUp={handleKeyUp}
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
        {<ResultList/>}
      </Grid>
    </Grid>
    <div
      ref={setRef}
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: "white"
      }}
    >
      <Divider/>
      <Button variant="outlined" startIcon={<NoteAdd/>} onClick={showEditDialog}>
        {t("create new", {item: t(typeName)})}
      </Button>
    </div>
  </div>
};

export default SimilarityFinder;
