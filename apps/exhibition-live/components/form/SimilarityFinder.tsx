import { Resolve } from "@jsonforms/core";
import { Storage as KnowledgebaseIcon } from "@mui/icons-material";
import {
  Chip,
  Divider,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { dcterms } from "@tpluscode/rdf-ns-builders";
import { JSONSchema7 } from "json-schema";
import * as React from "react";
import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { BASE_IRI } from "../config";
import { declarativeMappings } from "../config/lobidMappings";
import { useSettings } from "../state/useLocalSettings";
import { NodePropertyItem } from "../utils/graph/nodeToPropertyTree";
import { Img } from "../utils/image/Img";
import { mapByConfig } from "../utils/mapping/mapByConfig";
import { StrategyContext } from "../utils/mapping/mappingStrategies";
import DiscoverSearchTable from "./discover/DiscoverSearchTable";
import { slent } from "./formConfigs";
import K10PlusSearchTable, {
  findFirstInProps,
} from "./k10plus/K10PlusSearchTable";
import LobidSearchTable from "./lobid/LobidSearchTable";
import { findEntityByAuthorityIRI } from "../utils/discover";
import { useGlobalCRUDOptions } from "../state/useGlobalCRUDOptions";

// @ts-ignore
type Props = {
  data: any;
  classIRI: string;
  jsonSchema: JSONSchema7;
  onEntityIRIChange?: (entityIRI: string | undefined) => void;
  onMappedDataAccepted?: (data: any) => void;
  searchOnDataPath?: string;
  search?: string;
};
type State = {};

type KnowledgeSources = "kb" | "gnd" | "wikidata" | "k10plus" | "ai";
type SelectedEntity = {
  id: string;
  source: KnowledgeSources;
};

const strategyContext: (doQuery: (query) => Promise<any>) => StrategyContext = (
  doQuery,
) => ({
  getPrimaryIRIBySecondaryIRI: async (
    secondaryIRI: string,
    authorityIRI: string,
    typeIRI: string,
  ) => {
    console.warn("using stub method");
    const ids = await findEntityByAuthorityIRI(secondaryIRI, doQuery);
    if (ids.length > 0) {
      console.warn("found entity more then one entity");
    }
    return ids[0] || null; //'http://example.com/1231231'
  },
  authorityIRI: "http://d-nb.info/gnd",
  newIRI: (typeIRI: string) => {
    return slent(uuidv4()).value;
  },
});
const SimilarityFinder: FunctionComponent<Props> = ({
  data,
  classIRI,
  onEntityIRIChange,
  onMappedDataAccepted,
  searchOnDataPath,
  search,
  jsonSchema,
}) => {
  const { openai } = useSettings();
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<
    KnowledgeSources[]
  >(["kb"]);
  const [entitySelected, setEntitySelected] = useState<
    SelectedEntity | undefined
  >();
  const searchString = useMemo<string | null>(
    () =>
      search ||
      (searchOnDataPath && Resolve.data(data, searchOnDataPath)) ||
      null,
    [data, searchOnDataPath, search],
  );
  const handleKnowledgeSourceChange = useCallback(
    (
      event: React.MouseEvent<HTMLElement>,
      newKnowledgeSources: KnowledgeSources[],
    ) => {
      if (entitySelected) {
        setEntitySelected(undefined);
      }
      setSelectedKnowledgeSources(newKnowledgeSources);
    },
    [entitySelected, setEntitySelected, setSelectedKnowledgeSources],
  );
  const typeName = useMemo(
    () => classIRI.substring(BASE_IRI.length, classIRI.length),
    [classIRI],
  );
  const handleSelect = useCallback(
    (id: string | undefined, source: KnowledgeSources) => {
      setEntitySelected(id ? { id, source } : undefined);
    },
    [setEntitySelected],
  );
  const handleMapAbstractAndDescUsingAI = useCallback(
    async (id: string | undefined, entryData: any) => {
      const newData = mapAbstractDataUsingAI(id, typeName, entryData, {
        jsonSchema,
        openai,
      });
      onMappedDataAccepted && onMappedDataAccepted(newData);
    },
    [typeName, onMappedDataAccepted, jsonSchema],
  );
  const handleMapUsingAI = useCallback(
    async (id: string | undefined, entryData: any) => {
      const newData = await mapDataUsingAI(id, typeName, entryData, {
        jsonSchema,
        openai,
      });
      onMappedDataAccepted && onMappedDataAccepted(newData);
    },
    [typeName, onMappedDataAccepted, jsonSchema],
  );

  const { crudOptions } = useGlobalCRUDOptions();
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
          strategyContext(crudOptions?.selectFetch),
        );
        const inject = {
          "@type": classIRI,
          authorityID: {
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
    [typeName, onMappedDataAccepted, crudOptions?.selectFetch],
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
      console.log("handleAcceptKXP", id, entryData);
      const props = entryData.properties;
      if (!props) return;
      const title = findFirstInProps(props, dcterms.title);
      const description = findFirstInProps(props, dcterms.description);
      const abstract = findFirstInProps(props, dcterms.abstract);
      handleMapAbstractAndDescUsingAI(id, { title, description, abstract });
    },
    [handleManuallyMapData, handleMapUsingAI, selectedKnowledgeSources],
  );

  const handleEntityChange = useCallback(
    (id: string | undefined) => {
      onEntityIRIChange && onEntityIRIChange(id);
    },
    [onEntityIRIChange],
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

  return (
    <>
      <Grid container alignItems="center" direction={"column"} spacing={2}>
        <Grid item>
          <ToggleButtonGroup
            value={selectedKnowledgeSources}
            exclusive
            onChange={handleKnowledgeSourceChange}
            aria-label="Suche über verschiedene Wissensquellen"
          >
            <ToggleButton value="kb" aria-label="lokale Datenbank">
              <KnowledgebaseIcon />
            </ToggleButton>
            <ToggleButton value="gnd" aria-label="GND">
              <Img
                alt={"gnd logo"}
                width={24}
                height={24}
                src={"/Icons/gnd-logo.png"}
              />
            </ToggleButton>
            {/*<ToggleButton value="wikidata" aria-label="Wikidata">
                <Img alt={'wikidata logo'} width={30} height={24} src={'/Icons/Wikidata-logo-en.svg'}/>
              </ToggleButton>
              <ToggleButton value="k10plus" aria-label="Wikidata">
                <Img alt={'k10plus logo'} width={40} height={30} src={'/Icons/k10plus-logo.png'}/>
              </ToggleButton>*/}
          </ToggleButtonGroup>
        </Grid>
        <Grid item>
          {entitySelected && (
            <Chip
              label={`${entitySelected.source}:${entitySelected.id}`}
              onDelete={() => handleSelect(undefined, entitySelected.source)}
            />
          )}
          {searchString && <Chip label={`Suchwort:${searchString}`} />}
        </Grid>
      </Grid>
      {searchString &&
        (!entitySelected || entitySelected.source == "kb") &&
        selectedKnowledgeSources?.includes("kb") && (
          <>
            <DiscoverSearchTable
              searchString={searchString}
              typeName={typeName}
              classIRI={classIRI}
              onAcceptItem={handleEntityChange}
              onSelect={handleSelectKB}
            />
            <Divider />
          </>
        )}
      {searchString &&
        (!entitySelected || entitySelected.source == "gnd") &&
        selectedKnowledgeSources?.includes("gnd") && (
          <>
            <LobidSearchTable
              onAcceptItem={handleAccept}
              searchString={searchString}
              typeName={typeName}
              onSelect={handleSelectGND}
            />
            <Divider />
          </>
        )}
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
    </>
  );
};

export default SimilarityFinder;
