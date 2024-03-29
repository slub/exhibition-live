import { Box, BoxProps } from "@mui/material";
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
import { useTranslation } from "next-i18next";
import { PrimaryField } from "@slub/edb-core-types";

type EntityDetailElementProps = {
  typeIRI: string | undefined;
  entityIRI: string;
  data: any;
  cardActionChildren?: React.ReactNode;
  inlineEditing?: boolean;
  readonly?: boolean;
};

export const EntityDetailElement = ({
  typeIRI,
  entityIRI,
  data: initialData,
  cardActionChildren,
  inlineEditing,
  readonly,
  ...rest
}: EntityDetailElementProps & Partial<BoxProps>) => {
  const boxProps = rest || {};
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
    { enabled: true, refetchOnWindowFocus: true, initialData: initialData },
    "show",
  );
  const { t } = useTranslation();
  const data = initialData || rawData?.document;
  const cardInfo = useMemo<PrimaryFieldResults<string>>(() => {
    const fieldDecl = primaryFields[typeName] as PrimaryField | undefined;
    if (data && fieldDecl)
      return applyToEachField(data, fieldDecl, extractFieldIfString);
    return {
      label: null,
      description: null,
      image: null,
    };
  }, [typeName, data]);

  return (
    <Box sx={{ p: 2, ...(rest.sx || {}) }} {...rest}>
      <EntityDetailCard
        typeIRI={classIRI}
        entityIRI={entityIRI}
        data={data}
        cardInfo={cardInfo}
        cardActionChildren={cardActionChildren}
        inlineEditing={inlineEditing}
        readonly={readonly}
      />
    </Box>
  );
};
