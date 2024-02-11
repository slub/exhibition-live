import {
  AppBar,
  Box,
  Grid,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import useExtendedSchema from "../../state/useExtendedSchema";
import { useGlobalCRUDOptions } from "../../state/useGlobalCRUDOptions";
import { useCRUDWithQueryClient } from "../../state/useCRUDWithQueryClient";
import { defaultJsonldContext, defaultPrefix } from "../formConfigs";
import { useMemo } from "react";
import { primaryFields, typeIRItoTypeName } from "../../config";
import {
  applyToEachField,
  extractFieldIfString,
} from "../../utils/mapping/simpleFieldExtractor";
import { PrimaryFieldResults } from "../../utils/types";
import { EntityDetailCard } from "./EntityDetailCard";
import { useTypeIRIFromEntity } from "../../state";
import { useTranslation } from "react-i18next";

type EntityDetailElementProps = {
  typeIRI: string | undefined;
  entityIRI: string;
  data: any;
};

export const EntityDetailElement = ({
  typeIRI,
  entityIRI,
  data: liveData,
}: EntityDetailElementProps) => {
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
    { enabled: true, refetchOnWindowFocus: true, initialData: liveData },
    "show",
  );
  const { t } = useTranslation();
  const data = liveData || rawData?.document;
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

  return (
    <Box sx={{ m: 2 }}>
      <EntityDetailCard
        typeIRI={classIRI}
        entityIRI={entityIRI}
        data={data}
        cardInfo={cardInfo}
      />
    </Box>
  );
};
