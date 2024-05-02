import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useTypeIRIFromEntity } from "../../state";
import { useCallback, useEffect, useMemo, useState } from "react";
import { primaryFieldExtracts, typeIRItoTypeName } from "../../config";
import useExtendedSchema from "../../state/useExtendedSchema";
import { useCRUDWithQueryClient } from "../../state/useCRUDWithQueryClient";
import { defaultJsonldContext, defaultPrefix } from "../formConfigs";
import { useTranslation } from "next-i18next";
import { applyToEachField, extractFieldIfString } from "@slub/edb-ui-utils";
import { Button, Stack } from "@mui/material";
import { JSONSchema7 } from "json-schema";
import { uischemata } from "../uischemaForType";
import { uischemas } from "../uischemas";
import { SemanticJsonFormNoOps } from "../SemanticJsonFormNoOps";
import MuiEditDialog from "../../renderer/MuiEditDialog";
import { useSnackbar } from "notistack";
import { useFormDataStore } from "../../state/reducer";
import { PrimaryFieldResults } from "@slub/edb-core-types";
import { cleanJSONLD } from "@slub/sparql-schema";

type EntityDetailModalProps = {
  typeIRI: string | undefined;
  entityIRI: string;
  data: any;
  disableLoad?: boolean;
};
export const EditEntityModal = NiceModal.create(
  ({
    typeIRI,
    entityIRI,
    data: defaultData,
    disableLoad,
  }: EntityDetailModalProps) => {
    const modal = useModal();
    const typeIRIs = useTypeIRIFromEntity(entityIRI);
    const classIRI: string | undefined = typeIRI || typeIRIs?.[0];
    const typeName = useMemo(() => typeIRItoTypeName(classIRI), [classIRI]);
    const loadedSchema = useExtendedSchema({ typeName, classIRI });
    const { loadQuery, saveMutation } = useCRUDWithQueryClient({
      entityIRI,
      typeIRI: classIRI,
      schema: loadedSchema,
      queryOptions: {
        enabled: !disableLoad,
        refetchOnWindowFocus: true,
        initialData: defaultData,
      },
      loadQueryKey: "show",
    });
    const { t } = useTranslation();
    const [firstTimeSaved, setFirstTimeSaved] = useState(false);
    const [isStale, setIsStale] = useState(false);
    const data = loadQuery.data?.document || defaultData;
    const cardInfo = useMemo<PrimaryFieldResults<string>>(() => {
      const fieldDecl = primaryFieldExtracts[typeName];
      if (data && fieldDecl)
        return applyToEachField(data, fieldDecl, extractFieldIfString);
      return {
        label: null,
        description: null,
        image: null,
      };
    }, [typeName, data]);

    const { formData, setFormData } = useFormDataStore({
      entityIRI,
      typeIRI,
    });

    useEffect(() => {
      setFormData(data);
    }, [data, setFormData]);
    const uischema = useMemo(
      () => uischemata[typeName] || (uischemas as any)[typeName],
      [typeName],
    );
    const { enqueueSnackbar } = useSnackbar();

    const handleSaveSuccess = useCallback(() => {
      setFirstTimeSaved(true);
      setIsStale(false);
    }, [setFirstTimeSaved, setIsStale]);

    const handleSave = useCallback(
      async (saveSuccess?: () => void) => {
        saveMutation
          .mutateAsync(formData)
          .then(async (skipLoading?: boolean) => {
            enqueueSnackbar("Saved", { variant: "success" });
            !skipLoading && (await loadQuery.refetch());
            handleSaveSuccess();
            typeof saveSuccess === "function" && saveSuccess();
          })
          .catch((e) => {
            enqueueSnackbar("Error while saving " + e.message, {
              variant: "error",
            });
          });
      },
      [enqueueSnackbar, saveMutation, loadQuery, formData, handleSaveSuccess],
    );

    const handleAccept = useCallback(() => {
      const acceptCallback = async () => {
        let cleanedData = await cleanJSONLD(formData, loadedSchema, {
          jsonldContext: defaultJsonldContext,
          defaultPrefix,
          keepContext: true,
        });
        modal.resolve({
          entityIRI: formData["@id"],
          data: cleanedData,
        });
        modal.remove();
      };
      return handleSave(acceptCallback);
    }, [formData, loadedSchema, handleSave, modal]);

    const handleSaveAndAccept = useCallback(async () => {
      //await handleSave(handleAccept);
      await handleAccept();
    }, [handleAccept]);

    const handleFormDataChange = useCallback(
      async (data: any) => {
        setFormData(data);
        setIsStale(true);
      },
      [setIsStale, setFormData],
    );

    return (
      <MuiEditDialog
        open={modal.visible}
        onClose={() => modal.remove()}
        onSave={handleSave}
        title={cardInfo.label}
        editMode={true}
        actions={
          <Stack>
            <Button onClick={handleAccept}>
              {isStale || !firstTimeSaved ? t("save and accept") : t("accept")}
            </Button>
            <Button onClick={() => modal.remove()}>{t("cancel")}</Button>
          </Stack>
        }
      >
        <SemanticJsonFormNoOps
          data={formData}
          onChange={handleFormDataChange}
          typeIRI={typeIRI}
          defaultEditMode={true}
          searchText={""}
          schema={loadedSchema as JSONSchema7}
          formsPath={"root"}
          jsonFormsProps={{
            uischema,
            uischemas: uischemas,
          }}
          enableSidebar={false}
          disableSimilarityFinder={true}
          wrapWithinCard={true}
        />
      </MuiEditDialog>
    );
  },
);
