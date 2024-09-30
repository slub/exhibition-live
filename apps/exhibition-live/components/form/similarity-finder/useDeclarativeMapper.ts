import NiceModal from "@ebay/nice-modal-react";
import { NormDataMapping, PrimaryField } from "@slub/edb-core-types";
import { DeclarativeFlatMapping, mapByConfig } from "@slub/edb-data-mapping";
import { KnowledgeSources } from "@slub/edb-global-types";
import {
  useSimilarityFinderState,
  useModalRegistry,
  useGlobalCRUDOptions,
  useDataStore,
  useAdbContext,
} from "@slub/edb-state-hooks";
import { makeDefaultMappingStrategyContext } from "@slub/edb-ui-utils";
import { primaryFields } from "@slub/exhibition-schema";
import prefixes from "@zazuko/rdf-vocabularies/prefixes";
import { useCallback, useState, useEffect } from "react";

const getMappingConfig = (
  normDataMapping: Record<string, NormDataMapping>,
  authorityIRI: string,
  typeName: string,
) => {
  const declarativeMapping = normDataMapping[authorityIRI];
  if (!declarativeMapping) {
    throw new Error(`no mapping declaration config for ${authorityIRI}`);
  }
  const mappingConfig = declarativeMapping.mapping[typeName];
  if (!mappingConfig) {
    throw new Error(`no mapping config for ${typeName}`);
  }

  return mappingConfig;
};

export const useDeclarativeMapper = () => {
  const {
    schema,
    typeNameToTypeIRI,
    typeIRIToTypeName,
    queryBuildOptions,
    createEntityIRI,
    normDataMapping,
    jsonLDConfig,
  } = useAdbContext();
  const { crudOptions } = useGlobalCRUDOptions();
  const { dataStore, ready } = useDataStore({
    schema,
    crudOptionsPartial: crudOptions,
    typeNameToTypeIRI,
    queryBuildOptions,
  });

  const mapData = useCallback(
    async (
      id: string | undefined,
      classIRI: string,
      entryData: any,
      authorityIRI: string,
      limit: number = 1,
    ) => {
      if (!id || !entryData?.allProps) return;
      try {
        const defaultMappingContext = makeDefaultMappingStrategyContext(
          crudOptions?.selectFetch,
          {
            defaultPrefix: jsonLDConfig.defaultPrefix,
            prefixes,
          },
          createEntityIRI,
          typeIRIToTypeName,
          primaryFields,
          normDataMapping,
        );

        const mappingConfig = getMappingConfig(
          normDataMapping,
          authorityIRI,
          typeIRIToTypeName(classIRI),
        );

        const mappingContext = {
          ...defaultMappingContext,
          onNewDocument: async ({ _draft, ...doc }: any) => {
            const entityIRI = doc["@id"];
            const typeName_ = typeIRIToTypeName(doc["@type"]);
            //return dataStore.createDocument(typeName_, doc);
            try {
              const newDoc = await dataStore.upsertDocument(
                typeName_,
                entityIRI,
                doc,
              );
              return newDoc;
            } catch (e) {
              console.error("could not create document", e);
            }
            return null;
          },
          getPrimaryIRIBySecondaryIRI: async (
            secondaryIRI: string,
            authorityIRI: string,
            typeIRI: string,
          ) => {
            const typeName_ = typeIRIToTypeName(typeIRI);
            const ids = await dataStore.findDocumentsByAuthorityIRI(
              typeName_,
              secondaryIRI,
              authorityIRI,
              limit,
            );
            if (ids.length > 0) {
              console.warn("found more then one entity");
            }
            return ids[0] || null;
          },
          searchEntityByLabel: async (label: string, typeIRI: string) => {
            const typeName_ = typeIRIToTypeName(typeIRI);
            const ids = await dataStore.findDocumentsByLabel(
              typeName_,
              label,
              limit,
            );
            if (ids.length > 0) {
              console.warn("found more then one entity");
            }
            return ids[0] || null;
          },
        };
        const existingEntry = await mappingContext.getPrimaryIRIBySecondaryIRI(
          id,
          authorityIRI,
          classIRI,
        );
        const dataFromAuthority = await mapByConfig(
          entryData.allProps,
          {},
          mappingConfig,
          mappingContext,
        );

        const inject = {
          "@type": classIRI,
          idAuthority: {
            authority: authorityIRI,
            id: id,
          },
          lastNormUpdate: new Date().toISOString(),
        };
        const finalData = { ...dataFromAuthority, ...inject };
        console.log("finalData", finalData);
        return finalData;
      } catch (e) {
        console.error("could not map from authority", e);
      }
    },
    [
      typeIRIToTypeName,
      dataStore.upsertDocument,
      crudOptions?.selectFetch,
      createEntityIRI,
      jsonLDConfig.defaultPrefix,
      normDataMapping,
      prefixes,
      primaryFields,
      normDataMapping,
    ],
  );

  return { mapData };
};
