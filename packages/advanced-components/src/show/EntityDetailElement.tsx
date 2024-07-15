import { Box, BoxProps } from "@mui/material";
import { useAdbContext, useCRUDWithQueryClient } from "@slub/edb-state-hooks";
import { useMemo } from "react";
import { applyToEachField, extractFieldIfString } from "@slub/edb-data-mapping";
import { EntityDetailCard } from "./EntityDetailCard";
import { useTypeIRIFromEntity, useExtendedSchema } from "@slub/edb-state-hooks";
import { PrimaryField, PrimaryFieldResults } from "@slub/edb-core-types";
import { filterUndefOrNull } from "@slub/edb-ui-utils";

export type EntityDetailElementProps = {
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
  const {
    queryBuildOptions: { primaryFields },
    typeIRIToTypeName,
  } = useAdbContext();
  const typeIRIs = useTypeIRIFromEntity(entityIRI);
  const classIRI: string | undefined = typeIRI || typeIRIs?.[0];
  const typeName = useMemo(
    () => typeIRIToTypeName(classIRI),
    [classIRI, typeIRIToTypeName],
  );
  const loadedSchema = useExtendedSchema({ typeName });
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
  const data = initialData || rawData?.document;
  const fieldDeclaration = useMemo(
    () => primaryFields[typeName] as PrimaryField,
    [typeName, primaryFields],
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
