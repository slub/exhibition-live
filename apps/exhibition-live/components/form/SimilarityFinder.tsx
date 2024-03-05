import {Resolve} from "@jsonforms/core";
import {NoteAdd, Storage as KnowledgebaseIcon} from "@mui/icons-material";
import {Badge, Box, Button, Divider, Grid, TextField} from "@mui/material";
import ClassicResultListWrapper from "./result/ClassicResultListWrapper";
import {dcterms} from "@tpluscode/rdf-ns-builders";
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
import {NodePropertyItem} from "../utils/graph/nodeToPropertyTree";
import {Img} from "../utils/image/Img";
import {mapByConfig} from "../utils/mapping/mapByConfig";
import {
    DeclarativeMapping,
    StrategyContext,
} from "../utils/mapping/mappingStrategies";
import DiscoverSearchTable from "./discover/DiscoverSearchTable";
import {sladb, slent} from "./formConfigs";
import K10PlusSearchTable, {
    findFirstInProps,
} from "./k10plus/K10PlusSearchTable";
import LobidSearchTable from "./lobid/LobidSearchTable";
import {findEntityByAuthorityIRI} from "../utils/discover";
import {useGlobalCRUDOptions} from "../state/useGlobalCRUDOptions";
import {mapAbstractDataUsingAI, mapDataUsingAI} from "../utils/ai";
import {useGlobalSearch, useSimilarityFinderState} from "../state";
import {useTranslation} from "next-i18next";
import {searchEntityByLabel} from "../utils/discover/searchEntityByLabel";
import {primaryFields, typeIRItoTypeName} from "../config";
import NiceModal from "@ebay/nice-modal-react";
import {EditEntityModal} from "./edit/EditEntityModal";
import {PrimaryField} from "../utils/types";

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

    const {resetElementIndex, elementIndex} = useSimilarityFinderState();
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

    const {crudOptions} = useGlobalCRUDOptions();
    const handleManuallyMapData = useCallback(
        async (id: string | undefined, entryData: any) => {
            if (!id || !entryData?.allProps) return;
            const mappingConfig = declarativeMappings[typeName];
            if (!mappingConfig) {
                console.warn(`no mapping config for ${typeName}`);
                return;
            }
            try {
                const dataFromGND = await mapByConfig(
                    entryData.allProps,
                    {},
                    mappingConfig,
                    makeDefaultMappingStrategyContext(
                        crudOptions?.selectFetch,
                        declarativeMappings,
                    ),
                );
                const inject = {
                    "@type": classIRI,
                    authorityID: {
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
        [classIRI, typeName, onMappedDataAccepted, crudOptions?.selectFetch],
    );

    const handleAccept = useCallback(
        (id: string | undefined, entryData: any) => {
            if (selectedKnowledgeSources?.includes("ai")) {
                handleMapUsingAI(id, entryData);
            } else {
                handleManuallyMapData(id, entryData);
            }
        },
        [handleManuallyMapData, handleMapUsingAI, selectedKnowledgeSources],
    );

    const handleAcceptKXP = useCallback(
        (id: string | undefined, entryData: NodePropertyItem) => {
            const props = entryData.properties;
            if (!props) return;
            const title = findFirstInProps(props, dcterms.title);
            const description = findFirstInProps(props, dcterms.description);
            const abstract = findFirstInProps(props, dcterms.abstract);
            handleMapAbstractAndDescUsingAI(id, {title, description, abstract});
        },
        [handleMapAbstractAndDescUsingAI],
    );

    const handleEntityChange = useCallback(
        (id: string | undefined, data: any) => {
            onEntityIRIChange && onEntityIRIChange(id);
            onExistingEntityAccepted && onExistingEntityAccepted(id, data);
        },
        [onEntityIRIChange, onExistingEntityAccepted],
    );

    const handleSelectGND = useCallback(
        (id: string | undefined) => handleSelect(id, "gnd"),
        [handleSelect],
    );
    const handleSelectKB = useCallback(
        (id: string | undefined) => handleSelect(id, "kb"),
        [handleSelect],
    );
    const handleSelectWikidata = useCallback(
        (id: string | undefined) => handleSelect(id, "wikidata"),
        [handleSelect],
    );
    const handleSelectK10plus = useCallback(
        (id: string | undefined) => handleSelect(id, "k10plus"),
        [handleSelect],
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

    return <div style={{overflow: 'hidden'}}>

        <Grid container alignItems="center" direction={"column"} spacing={2}
              style={{overflowY: "auto", marginBottom: margin}}>
            <Grid item sx={{width: "100%"}}>
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
                    <Box sx={{flexGrow: 1}}>
                        <TextField
                            variant={"standard"}
                            disabled={Boolean(dataPathSearch)}
                            fullWidth={true}
                            value={searchString || ""}
                            onChange={(e) =>
                                handleSearchStringChange(e.currentTarget.value)
                            }
                            label={`Suche in ${selectedKnowledgeSources.join(",")} nach ${t(
                                typeName,
                            )} `}
                            onKeyUp={handleKeyUp}
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
                        <Badge
                            color="primary"
                            sx={{m: 0.5}}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                            }}
                            variant="dot"
                            overlap="circular"
                            invisible={!selectedKnowledgeSources?.includes("kb")}
                        >
                            <KnowledgebaseIcon/>
                        </Badge>
                        <Badge
                            color="primary"
                            sx={{m: 0.5}}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                            }}
                            variant="dot"
                            overlap="circular"
                            invisible={!selectedKnowledgeSources?.includes("gnd")}
                        >
                            <Img
                                alt={"gnd logo"}
                                width={24}
                                height={24}
                                src={"/Icons/gnd-logo.png"}
                            />
                        </Badge>
                        <Badge
                            color="primary"
                            sx={{m: 0.5}}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                            }}
                            variant="dot"
                            overlap="circular"
                            invisible={!selectedKnowledgeSources?.includes("k10plus")}
                        >
                            <Img
                                alt={"gnd logo"}
                                width={24}
                                height={24}
                                src={"/Icons/k10plus-logo.png"}
                            />
                        </Badge>
                    </Box>
                </Grid>
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
                <ClassicResultListWrapper
                    label="Treffer in lokaler Datenbank"
                    selected={selectedKnowledgeSources?.includes("kb")}
                    handleClick={handleSelectKB}
                >
                    {searchString &&
                        (!entitySelected || entitySelected.source == "kb") &&
                        selectedKnowledgeSources?.includes("kb") && (
                            <DiscoverSearchTable
                                searchString={searchString}
                                typeName={typeName}
                                classIRI={classIRI}
                                onAcceptItem={handleEntityChange}
                                onSelect={handleSelectKB}
                                selectedIndex={elementIndex}
                            />
                        )}
                </ClassicResultListWrapper>
                <ClassicResultListWrapper
                    label="Treffer in gnd"
                    selected={selectedKnowledgeSources?.includes("gnd")}
                    handleClick={handleSelectGND}
                >
                    {searchString &&
                        (!entitySelected || entitySelected.source == "gnd") &&
                        selectedKnowledgeSources?.includes("gnd") && (
                            <>
                                <LobidSearchTable
                                    onAcceptItem={handleAccept}
                                    searchString={searchString}
                                    typeIRI={classIRI}
                                    onSelect={handleSelectGND}
                                />
                                <Divider/>
                            </>
                        )}
                </ClassicResultListWrapper>
                {
                    <ClassicResultListWrapper
                        label="Treffer im k10plus"
                        selected={selectedKnowledgeSources?.includes("k10plus")}
                        handleClick={handleSelectK10plus}
                    >
                        {searchString &&
                            (!entitySelected || entitySelected.source == "k10plus") &&
                            selectedKnowledgeSources?.includes("k10plus") && (
                                <K10PlusSearchTable
                                    onAcceptItem={handleAcceptKXP}
                                    searchString={searchString}
                                    typeName={typeName}
                                    onSelect={handleSelectK10plus}
                                />
                            )}
                    </ClassicResultListWrapper>
                }
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
            <Button variant="outlined" startIcon={<NoteAdd/>} onClick={showEditDialog} >
                {t("create new", {item: t(typeName)})}
            </Button>
        </div>
    </div>
};

export default SimilarityFinder;
