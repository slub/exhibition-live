import { useGlobalSearch } from "./useGlobalSearch";
import { useCallback, useState } from "react";
import { useCRUDWithQueryClient } from "./useCRUDWithQueryClient";
import { JSONSchema7 } from "json-schema";
import get from "lodash/get";
import { useRightDrawerState } from "./useRightDrawerState";
import { useAdbContext } from "./provider";

export const useGlobalSearchWithHelper = (
  typeName: string,
  typeIRI: string,
  schema: JSONSchema7,
  formsPath: string,
  onDataAccepted?: (data: any) => void,
) => {
  const {
    createEntityIRI,
    queryBuildOptions: { primaryFields },
  } = useAdbContext();
  const globalSearch = useGlobalSearch();
  const { setTypeName, setPath, setSearch, path } = globalSearch;

  const isActive = path === formsPath;
  const [searchString, setSearchString] = useState<string | undefined>();
  const handleSearchStringChange = useCallback(
    (value: string | undefined) => {
      setSearchString(value);
      setSearch(value || "");
    },
    [setSearchString, setSearch],
  );
  const { keepMounted, setOpen } = useRightDrawerState();

  const { saveMutation } = useCRUDWithQueryClient({
    typeIRI,
    schema,
    queryOptions: { enabled: false },
    allowUnsafeSourceIRIs: true,
  });

  const handleMappedData = useCallback(
    (newData: any) => {
      const newIRI = createEntityIRI(typeName);
      const finalData = {
        ...newData,
        "@id": newIRI,
        "@type": typeIRI,
      };
      console.log("will save", finalData);

      saveMutation.mutate(finalData);
      const labelField = primaryFields[typeName]?.label;
      const label = labelField ? get(newData, labelField) : "";
      onDataAccepted &&
        onDataAccepted({
          "@id": newIRI,
          __label: label,
        });
    },
    [
      onDataAccepted,
      saveMutation,
      typeIRI,
      typeName,
      createEntityIRI,
      primaryFields,
    ],
  );

  const handleFocus = useCallback(() => {
    setTypeName(typeName);
    setPath(formsPath);
    setSearch(searchString || "");
    if (keepMounted) setOpen(true);
  }, [
    searchString,
    setSearch,
    setTypeName,
    typeName,
    setPath,
    formsPath,
    keepMounted,
    setOpen,
  ]);

  return {
    ...globalSearch,
    handleSearchStringChange,
    handleMappedData,
    handleFocus,
    searchString,
    isActive,
  };
};
