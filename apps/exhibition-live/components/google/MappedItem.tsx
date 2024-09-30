import { mapByConfigFlat } from "@slub/edb-data-mapping";
import type { DeclarativeFlatMappings } from "@slub/edb-data-mapping";
import { CachedWorkSheet, CellTypeLike } from "./useCachedWorkSheet";
import { CRUDFunctions } from "@slub/edb-core-types";
import { useAdbContext, useQuery } from "@slub/edb-state-hooks";
import React, { useCallback } from "react";
import { useTranslation } from "next-i18next";
import { CircularProgress, List } from "@mui/material";
import { TypedListItem } from "@slub/edb-advanced-components";
import { makeDefaultMappingStrategyContext } from "@slub/edb-ui-utils";

export type MappedItemProps<CellType extends CellTypeLike> = {
  path: string;
  index: number;
  spreadSheetMapping: DeclarativeFlatMappings;
  workSheet: CachedWorkSheet<CellType>;
  crudOptions?: CRUDFunctions;
};
export const MappedItem = <CellType extends CellTypeLike>({
  path,
  index,
  spreadSheetMapping,
  workSheet,
  crudOptions,
}: MappedItemProps<CellType>) => {
  const {
    queryBuildOptions: { prefixes, primaryFields },
    createEntityIRI,
    typeNameToTypeIRI,
    typeIRIToTypeName,
    jsonLDConfig: { defaultPrefix },
    components: { EntityDetailModal },
    normDataMapping,
  } = useAdbContext();
  const mapData = useCallback(async () => {
    console.log("will map row", index);
    try {
      const targetData = {
        __index: index,
        "@id": createEntityIRI("Exhibition"),
        "@type": typeNameToTypeIRI("Exhibition"),
      };
      console.log("will map by config");
      const mappedData = await mapByConfigFlat(
        (col: number | string) => {
          const cell = workSheet.getCell(index, col as number);
          return cell.value as string;
        },
        targetData,
        spreadSheetMapping,
        makeDefaultMappingStrategyContext(
          crudOptions?.selectFetch,
          {
            defaultPrefix,
            prefixes,
          },
          createEntityIRI,
          typeIRIToTypeName,
          primaryFields,
          normDataMapping,
        ),
      );
      return mappedData;
    } catch (e) {
      console.warn("failed to map row", index, e);
    }
    return null;
  }, [
    workSheet,
    crudOptions,
    spreadSheetMapping,
    primaryFields,
    index,
    createEntityIRI,
    defaultPrefix,
    prefixes,
    typeIRIToTypeName,
    normDataMapping,
  ]);

  const { data, isLoading } = useQuery(["mappedData", path], mapData, {
    enabled: workSheet.loaded && spreadSheetMapping.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes,
  });
  const { t } = useTranslation();

  return isLoading ? (
    <>
      <CircularProgress title={t("calculate mapped data")} />
    </>
  ) : (
    <List>
      {data?.["@type"] && (
        <TypedListItem index={index} data={data} disableLoad={true} readonly />
      )}
    </List>
  );
};
