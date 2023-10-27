import { Resolve } from "@jsonforms/core";
import {
  AndroidOutlined,
  Storage as KnowledgebaseIcon,
} from "@mui/icons-material";
import {
  Chip,
  Divider,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { dcterms } from "@tpluscode/rdf-ns-builders";
import { JSONSchema7 } from "json-schema";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
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

export const isPrimitive = (type?: string) =>
  type === "string" ||
  type === "number" ||
  type === "integer" ||
  type === "boolean";
const model = "gpt-3.5-turbo";
// @ts-ignore
export const filterForPrimitiveProperties = (
  properties: JSONSchema7["properties"],
) =>
  Object.fromEntries(
    Object.entries(properties || {}).filter(
      ([, value]) =>
        typeof value === "object" &&
        (isPrimitive(String(value.type)) ||
          value.oneOf ||
          (value.type === "array" &&
            typeof value.items === "object" &&
            isPrimitive(String((value.items as any).type)))),
    ),
  );
const GND_IRI =
  "http://ontologies.slub-dresden.de/exhibition/entity/Authority#s-1";
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

const strategyContext: StrategyContext = {
  getPrimaryIRIBySecondaryIRI: async (
    secondaryIRI: string,
    authorityIRI: string,
    typeIRI: string,
  ) => {
    console.warn("using stub method");

    return null; //'http://example.com/1231231'
  },
  authorityIRI: "http://d-nb.info/gnd",
  newIRI: (typeIRI: string) => {
    return slent(uuidv4()).value;
  },
};
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
      if (!openai?.organization || !openai?.apiKey) {
        console.log("No OpenAI API Key or Organization set");
      }
      const configuration = new Configuration(openai);
      const openaiInstance = new OpenAIApi(configuration);
      const entrySchema = {
        type: "object",
        properties: filterForPrimitiveProperties(jsonSchema.properties),
      };
      try {
        const firstMessages: ChatCompletionRequestMessage[] = [
          {
            role: "system",
            content:
              "The task is to map an abstract and description of an entity from a librarian catalogue to a more simple model of a user given JSON Schema. First listen to the next two user prompts, only respond to system commands.",
          },
          {
            role: "user",
            content: `The JSONSchema of the object of type \`${typeName}\` is:
           \`\`\`json
            ${JSON.stringify(entrySchema)}
            \`\`\``,
          },
          {
            role: "user",
            content: `The data returned from the library catalog is:
            \`\`\`json
            ${JSON.stringify(entryData)}
            \`\`\``,
          },
          {
            role: "system",
            content: `Extract dates, like beginning and end of the ${typeName} from the text according to the schema. Hint: dates tha map to an integer should be converted to YYYYMMDD, if any of the part is unknown fill it with 0. Omit null values in the resultset.`,
          },
        ];
        const response = await openaiInstance.createChatCompletion({
          model: model,
          messages: firstMessages,
          max_tokens: 1500,
        });
        const dataFromGNDRaw =
          response.data?.choices?.[0]?.message?.content || "{}";
        console.log({ data: response.data, dataFromGNDRaw });
        const { ["@id"]: _1, ...dataFromGND } = JSON.parse(dataFromGNDRaw);
        const inject = {
          authority: {
            "@id": GND_IRI,
          },
          idAuthority: id,
          lastNormUpdate: new Date().toISOString(),
        };
        const newData = { ...dataFromGND, ...inject };
        onMappedDataAccepted && onMappedDataAccepted(newData);
      } catch (e) {
        console.error("could not guess mapping", e);
      }
    },
    [typeName, onMappedDataAccepted, jsonSchema],
  );
  const handleMapUsingAI = useCallback(
    async (id: string | undefined, entryData: any) => {
      if (!openai?.organization || !openai?.apiKey) {
        console.log("No OpenAI API Key or Organization set");
      }
      const configuration = new Configuration(openai);
      const openaiInstance = new OpenAIApi(configuration);
      const entrySchema = {
        type: "object",
        properties: filterForPrimitiveProperties(jsonSchema.properties),
      };
      try {
        const firstMessages: ChatCompletionRequestMessage[] = [
          {
            role: "system",
            content:
              "The task is to map complex norm data from the GND to a more simple model of a  user given JSON Schema. First listen to the next two user prompts, only respond to system commands.",
          },
          {
            role: "user",
            content: `The JSONSchema of the object of type \`${typeName}\` is:
           \`\`\`json
            ${JSON.stringify(entrySchema)}
            \`\`\``,
          },
          {
            role: "user",
            content: `The data returned from the GND is:
            \`\`\`json
            ${JSON.stringify(entryData)}
            \`\`\``,
          },
          {
            role: "system",
            content:
              "Output the result of mapping the GND data to the schema (minified JSON without newlines). Hint: dates tha map to an integer should be converted to YYYYMMDD, if any of the part is unknown fill it with 0. Omit null values in the resultset.",
          },
        ];
        const generateMappingMessage: ChatCompletionRequestMessage[] = [
          {
            role: "system",
            content:
              "for each mapped target field, give a small declarative representation of gnd fields used as input and a strategy used for mapping. The diffrent strategies will be implemented by a developer. Output the declarations as JSON.",
          },
        ];
        const response = await openaiInstance.createChatCompletion({
          model: model,
          messages: firstMessages,
          max_tokens: 1200,
        });
        const dataFromGNDRaw =
          response.data?.choices?.[0]?.message?.content || "{}";
        console.log({ data: response.data, dataFromGNDRaw });
        const { ["@id"]: _1, ...dataFromGND } = JSON.parse(dataFromGNDRaw);
        const inject = {
          authority: {
            "@id": GND_IRI,
          },
          idAuthority: id,
          lastNormUpdate: new Date().toISOString(),
        };
        const newData = { ...dataFromGND, ...inject };
        onMappedDataAccepted && onMappedDataAccepted(newData);
        const mappingResponse = await openaiInstance.createChatCompletion({
          model: model,
          messages: [
            ...firstMessages,
            {
              role: "assistant",
              content: dataFromGNDRaw,
            },
            ...generateMappingMessage,
          ],
          max_tokens: 1200,
        });
        const mappingDataRaw =
          mappingResponse.data?.choices?.[0]?.message?.content || "{}";
        console.log({ mappingDataRaw });
      } catch (e) {
        console.error("could not guess mapping", e);
      }
    },
    [typeName, onMappedDataAccepted, jsonSchema],
  );

  const handleManuallyMapData = useCallback(
    async (id: string | undefined, entryData: any) => {
      console.log("map manually");
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
          strategyContext,
        );
        const inject = {
          "@type": classIRI,
          authority: {
            "@id": GND_IRI,
          },
          lastNormUpdate: new Date().toISOString(),
        };
        console.log({ dataFromGND });
        onMappedDataAccepted &&
          onMappedDataAccepted({ ...dataFromGND, ...inject });
      } catch (e) {
        console.error("could not map from authority", e);
      }
    },
    [typeName, onMappedDataAccepted],
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
      if (selectedKnowledgeSources?.includes("ai")) {
        console.log("handleAcceptKXP", id, entryData);
        const props = entryData.properties;
        if (!props) return;
        const title = findFirstInProps(props, dcterms.title);
        const description = findFirstInProps(props, dcterms.description);
        const abstract = findFirstInProps(props, dcterms.abstract);
        handleMapAbstractAndDescUsingAI(id, { title, description, abstract });
      } else {
        handleManuallyMapData(id, entryData);
      }
    },
    [handleManuallyMapData, handleMapUsingAI, selectedKnowledgeSources],
  );

  const handleEntityChange = useCallback(
    (id: string | undefined) => {
      onEntityIRIChange && onEntityIRIChange(id);
    },
    [onEntityIRIChange],
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
              </ToggleButton>
              <ToggleButton value="ai" aria-label="use AI">
                <AndroidOutlined/>
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
              onSelect={(id) => handleSelect(id, "kb")}
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
              onSelect={(id) => handleSelect(id, "gnd")}
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
            onSelect={(id) => handleSelect(id, "k10plus")}
          />
        )}
    </>
  );
};

export default SimilarityFinder;
