import { useGlobalSearch } from "./useGlobalSearch";
import { useCallback, useState } from "react";
import { useGlobalCRUDOptions } from "./useGlobalCRUDOptions";
import { useCRUDWithQueryClient } from "./useCRUDWithQueryClient";
import { JSONSchema7 } from "json-schema";
import {
  defaultJsonldContext,
  defaultPrefix,
  slent,
} from "../form/formConfigs";
import NiceModal from "@ebay/nice-modal-react";
import GenericModal from "../form/GenericModal";
import { v4 as uuidv4 } from "uuid";
import get from "lodash/get";
import { primaryFields } from "../config";

export const useGlobalSearchWithHelper = (
  typeName: string,
  typeIRI: string,
  schema: JSONSchema7,
  formsPath: string,
  onDataAccepted?: (data: any) => void,
) => {
  const globalSearch = useGlobalSearch();
  const { setTypeName, setPath, setSearch, path } = globalSearch;

  const isActive = path === formsPath;
  const [searchString, setSearchString] = useState<string | undefined>();
  const handleSearchStringChange = useCallback(
    (value: string | undefined) => {
      setSearchString(value);
      setSearch(value);
    },
    [setSearchString, setSearch],
  );

  const { crudOptions } = useGlobalCRUDOptions();
  const { saveMutation } = useCRUDWithQueryClient(
    null,
    typeIRI,
    schema,
    defaultPrefix,
    crudOptions,
    defaultJsonldContext,
    { enabled: false },
    undefined,
    true,
  );

  const handleMappedData = useCallback(
    (newData: any) => {
      NiceModal.show(GenericModal, {
        type:
          newData["@type"] !== typeIRI
            ? "confirm save mapping"
            : "confirm mapping",
      }).then(() => {
        const prefix = schema.title || slent[""].value;
        const newIRI = `${prefix}${uuidv4()}`;
        saveMutation.mutate({
          ...newData,
          "@id": newIRI,
          "@type": typeIRI,
        });
        const label = get(newData, primaryFields[typeName]?.label);
        onDataAccepted &&
          onDataAccepted({
            "@id": newIRI,
            __label: label,
          });
      });
    },
    [onDataAccepted, saveMutation, schema, typeIRI, typeName],
  );

  const handleFocus = useCallback(() => {
    setTypeName(typeName);
    setPath(formsPath);
    setSearch(searchString);
  }, [searchString, setSearch, setTypeName, typeName, setPath, formsPath]);

  return {
    ...globalSearch,
    handleSearchStringChange,
    handleMappedData,
    handleFocus,
    searchString,
    isActive,
  };
};
