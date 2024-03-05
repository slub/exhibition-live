import NiceModal, {useModal} from "@ebay/nice-modal-react";
import {useTypeIRIFromEntity} from "../../state";
import {useCallback, useMemo, useState} from "react";
import {primaryFields, typeIRItoTypeName} from "../../config";
import useExtendedSchema from "../../state/useExtendedSchema";
import {useGlobalCRUDOptions} from "../../state/useGlobalCRUDOptions";
import {useCRUDWithQueryClient} from "../../state/useCRUDWithQueryClient";
import {defaultJsonldContext, defaultPrefix} from "../formConfigs";
import {useTranslation} from "next-i18next";
import {PrimaryFieldResults} from "../../utils/types";
import {applyToEachField, extractFieldIfString} from "../../utils/mapping/simpleFieldExtractor";
import {
    Button
} from "@mui/material";
import {JSONSchema7} from "json-schema";
import {uischemata} from "../uischemaForType";
import {uischemas} from "../uischemas";
import {cleanJSONLD} from "../../utils/crud";
import GenericModal from "../GenericModal";
import {SemanticJsonFormNoOps} from "../SemanticJsonFormNoOps";
import MuiEditDialog from "../../renderer/MuiEditDialog";
import {useSnackbar} from "notistack";

type EntityDetailModalProps = {
    typeIRI: string | undefined;
    entityIRI: string;
    data: any;
    disableLoad?: boolean;
};
export const EditEntityModal = NiceModal.create(
    ({ typeIRI, entityIRI, data: defaultData, disableLoad }: EntityDetailModalProps) => {
        const modal = useModal();
        const typeIRIs = useTypeIRIFromEntity(entityIRI);
        const classIRI: string | undefined = typeIRI || typeIRIs?.[0];
        const typeName = useMemo(() => typeIRItoTypeName(classIRI), [classIRI]);
        const loadedSchema = useExtendedSchema({ typeName, classIRI });
        const { crudOptions } = useGlobalCRUDOptions();
        const {
            loadQuery: { data: rawData },
        } = useCRUDWithQueryClient(
            entityIRI,
            classIRI,
            loadedSchema,
            defaultPrefix,
            crudOptions,
            defaultJsonldContext,
            { enabled: !disableLoad, refetchOnWindowFocus: true, initialData: defaultData },
            "show",
        );
        const { t } = useTranslation();
        const [firstTimeSaved, setFirstTimeSaved] = useState(false)
        const [isStale, setIsStale] = useState(false)
        const data = rawData?.document || defaultData;
        const cardInfo = useMemo<PrimaryFieldResults<string>>(() => {
            const fieldDecl = primaryFields[typeName];
            if (data && fieldDecl)
                return applyToEachField(data, fieldDecl, extractFieldIfString);
            return {
                label: null,
                description: null,
                image: null,
            };
        }, [typeName, data]);

        const [formData, setFormData] = useState<any>(data);
        const uischema = useMemo(
            () => uischemata[typeName] || (uischemas as any)[typeName],
            [typeName],
        );
        const { enqueueSnackbar } = useSnackbar();

        const { loadQuery, saveMutation, removeMutation } = useCRUDWithQueryClient(
            entityIRI,
            typeIRI,
            loadedSchema,
            defaultPrefix,
            crudOptions,
            defaultJsonldContext,
            { enabled: true },
        );
        const handleSaveSuccess = useCallback(() => {
            setFirstTimeSaved(true)
            setIsStale(false)
        }, [setFirstTimeSaved, setIsStale])
        const handleSave = useCallback(async (saveSuccess?: () => void) => {
            saveMutation
                .mutateAsync(formData)
                .then(async (skipLoading?: boolean) => {
                    enqueueSnackbar("Saved", { variant: "success" });
                    !skipLoading && (await loadQuery.refetch());
                    handleSaveSuccess()
                    typeof saveSuccess === "function" && saveSuccess()
                })
                .catch((e) => {
                    enqueueSnackbar("Error while saving " + e.message, {
                        variant: "error",
                    });
                });
        }, [enqueueSnackbar, saveMutation, loadQuery, formData, handleSaveSuccess]);

        const handleAccept = useCallback(() => {
          const acceptCallback = () => {
              cleanJSONLD(formData, loadedSchema, {
                  jsonldContext: defaultJsonldContext,
                  defaultPrefix,
                  keepContext: true,
              }).then((cleanedData) => {
                  modal.resolve({
                      entityIRI: formData["@id"],
                      data: cleanedData
                  })
                  modal.remove()
              })
          }
          if(isStale) {
            NiceModal.show(GenericModal, {
              type: "save before proceed"
            }).then(() => {
              handleSave(
                  acceptCallback
              )
            })
          } else {
            acceptCallback()
          }
        }, [formData, loadedSchema, handleSave, modal, isStale ])



        const handleFormDataChange = useCallback(async (data: any) => {
            setFormData(data)
            setIsStale(true)
        }, [setIsStale])

        return (
            <MuiEditDialog
                open={modal.visible}
                onClose={() => modal.remove()}
                onSave={handleSave}
                title={cardInfo.label}
                editMode={true}
                actions={<>
                    <Button onClick={handleAccept} disabled={!firstTimeSaved}>{t("accept")}</Button>
                    <Button onClick={() => modal.remove()}>{t("cancel")}</Button>
                </>}
            >
                    <SemanticJsonFormNoOps
                        data={formData}
                        onChange={handleFormDataChange}
                        typeIRI={typeIRI}
                        defaultEditMode={true}
                        searchText={""}
                        schema={loadedSchema as JSONSchema7}
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