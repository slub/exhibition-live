import {
  useAdbContext,
  useDataStore,
  useGlobalCRUDOptions,
} from "@slub/edb-state-hooks";
import { useMemo } from "react";
import { KBMainDatabase, Wikidata, GND, K10Plus } from "./provider";
import { KnowledgeBaseDescription } from "./types";

export const useKnowledgeBases = () => {
  const { schema, typeNameToTypeIRI, queryBuildOptions, jsonLDConfig } =
    useAdbContext();
  const { crudOptions } = useGlobalCRUDOptions();
  const { dataStore, ready } = useDataStore({
    schema,
    crudOptionsPartial: crudOptions,
    typeNameToTypeIRI,
    queryBuildOptions,
  });
  const kbs: KnowledgeBaseDescription[] = useMemo(
    () => [
      KBMainDatabase(dataStore, queryBuildOptions.primaryFields),
      Wikidata,
      GND,
      K10Plus,
    ],
    [queryBuildOptions, jsonLDConfig, dataStore, ready],
  );
  return kbs;
};
