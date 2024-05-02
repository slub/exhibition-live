import { Box, BoxProps } from "@mui/material";
import useExtendedSchema from "../../state/useExtendedSchema";
import { useCRUDWithQueryClient } from "@slub/edb-state-hooks";
import { useMemo } from "react";
import { primaryFields, typeIRItoTypeName } from "../../config";
import { applyToEachField, extractFieldIfString } from "@slub/edb-ui-utils";
import { EntityDetailCard } from "./EntityDetailCard";
import { useTypeIRIFromEntity } from "@slub/edb-state-hooks";
import { useTranslation } from "next-i18next";
import { PrimaryField, PrimaryFieldResults } from "@slub/edb-core-types";
import { filterUndefOrNull } from "@slub/edb-ui-utils";

type EntityDetailElementProps = {
  typeIRI: string | undefined;
  entityIRI: string;
  data: any;
  cardActionChildren?: React.ReactNode;
  disableInlineEditing?: boolean;
  readonly?: boolean;
};

export const EntityDetailElement = ({
  typeIRI,
  entityIRI,
  data: initialData,
  cardActionChildren,
  disableInlineEditing,
  readonly,
  ...rest
}: EntityDetailElementProps & Partial<BoxProps>) => {
  const boxProps = rest || {};
  const typeIRIs = useTypeIRIFromEntity(entityIRI);
  const classIRI: string | undefined = typeIRI || typeIRIs?.[0];
  const typeName = useMemo(() => typeIRItoTypeName(classIRI), [classIRI]);
  const loadedSchema = useExtendedSchema({ typeName, classIRI });
  const {
    loadQuery: { data: rawData },
  } = useCRUDWithQueryClient({
    entityIRI,
    typeIRI: classIRI,
    schema: loadedSchema,
    queryOptions: {
      enabled: true,
      refetchOnWindowFocus: true,
      initialData: initialData,
    },
    loadQueryKey: "show",
  });
  const { t } = useTranslation();
  const data = initialData || rawData?.document;
  const fieldDeclaration = useMemo(
    () => primaryFields[typeName] as PrimaryField,
    [typeName],
  );
  const cardInfo = useMemo<PrimaryFieldResults<string>>(() => {
    if (data && fieldDeclaration)
      return applyToEachField(data, fieldDeclaration, extractFieldIfString);
    return {
      label: null,
      description: null,
      image: null,
    };
  }, [fieldDeclaration, data]);

  const disabledProperties = useMemo(
    () => filterUndefOrNull(Object.values(fieldDeclaration)),
    [fieldDeclaration],
  );

  return (
    <Box sx={{ p: 2, ...(rest.sx || {}) }} {...rest}>
      <EntityDetailCard
        typeIRI={classIRI}
        entityIRI={entityIRI}
        data={data}
        cardInfo={cardInfo}
        cardActionChildren={cardActionChildren}
        disableInlineEditing={disableInlineEditing}
        readonly={readonly}
        tableProps={{ disabledProperties }}
      />
    </Box>
  );
};
