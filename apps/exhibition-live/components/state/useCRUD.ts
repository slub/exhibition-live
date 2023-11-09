import { useJsonldParser } from "./useJsonldParser";
import { JSONSchema7 } from "json-schema";
import {
  defaultJsonldContext,
  defaultPrefix,
  defaultQueryBuilderOptions,
} from "../form/formConfigs";
import { CRUDOptions, UseCRUDResults, useSPARQL_CRUD } from "./useSPARQL_CRUD";
import { useState } from "react";
import { useGlobalCRUDOptions } from "./useGlobalCRUDOptions";

export const useCRUD = (
  data: any,
  schema: JSONSchema7,
  crudOptionsPart: Partial<CRUDOptions> = {},
): UseCRUDResults => {
  const [jsonldData, setJsonldData] = useState<any>({});
  const { crudOptions } = useGlobalCRUDOptions();
  useJsonldParser(data, defaultJsonldContext, schema, {
    onJsonldData: setJsonldData,
    defaultPrefix,
    enabled: true,
  });
  return useSPARQL_CRUD(
    jsonldData["@id"],
    jsonldData["@type"],
    schema,
    //@ts-ignore
    {
      ...crudOptions,
      defaultPrefix,
      data: jsonldData,
      queryBuildOptions: defaultQueryBuilderOptions,
      queryOptions: {
        refetchOnWindowFocus: false,
      },
      queryKey: "root",
      ...crudOptionsPart,
    },
  );
};
