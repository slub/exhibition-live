import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./formStore";
import { selectFormData } from "./formSelectors";

type UseFormDataStoreType = {
  entityIRI: string;
  typeIRI: string;
  createNewEntityIRI?: () => string;
  onEntityIRIChange?: (newEntityIRI: string) => void;
  autoCreateNewEntityIRI?: boolean;
};

export const useFormDataStore = ({
  entityIRI,
  onEntityIRIChange,
  autoCreateNewEntityIRI,
  createNewEntityIRI,
  typeIRI,
}: UseFormDataStoreType) => {
  const formDataOrUndefined = useSelector<RootState>((state) =>
    selectFormData(state, entityIRI),
  ) as any;
  const formData = useMemo(
    () => formDataOrUndefined || {},
    [formDataOrUndefined],
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (
      !autoCreateNewEntityIRI ||
      !createNewEntityIRI ||
      typeof onEntityIRIChange !== "function"
    )
      return;
    console.log("create new IRI");
    onEntityIRIChange(createNewEntityIRI());
  }, [typeIRI, autoCreateNewEntityIRI, createNewEntityIRI]);

  const setFormData = useCallback(
    (data: any | ((_data: any) => any)) => {
      dispatch({
        type: "formData/updateFormData",
        payload: { propertyPath: entityIRI, updater: data },
      });
    },
    [dispatch, entityIRI],
  );

  return { formData, setFormData };
};
