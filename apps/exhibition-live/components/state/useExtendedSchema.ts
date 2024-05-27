import { JSONSchema7 } from "json-schema";
import { useMemo } from "react";

import genSlubJSONLDSemanticProperties from "../form/genSlubJSONLDSemanticProperties";
import { defs, prepareStubbedSchema } from "@slub/json-schema-utils";
import { useAdbContext } from "@slub/edb-state-hooks";

type UseExtendedSchemaProps = {
  typeName: string;
};

const genSlubRequiredProperties = (_modelName: string) => {
  return ["@type", "@id"];
};

export const makeStubSchema: (
  typeName: string,
  schema: JSONSchema7,
) => JSONSchema7 = (typeName, schema) => {
  const preparedSchema = prepareStubbedSchema(
    schema,
    genSlubJSONLDSemanticProperties,
    genSlubRequiredProperties,
    {
      excludeType: ["InvolvedPerson", "InvolvedCorporation", "AuthorityEntry"],
      excludeSemanticPropertiesForType: ["AuthorityEntry"],
    },
  );
  const definitions = defs(preparedSchema);
  const specificModel = (definitions[typeName] as object | undefined) || {};
  return {
    ...(typeof preparedSchema === "object" ? preparedSchema : {}),
    ...specificModel,
  };
};

const useExtendedSchema = ({ typeName }: UseExtendedSchemaProps) => {
  const { schema } = useAdbContext();
  return useMemo(() => {
    return makeStubSchema(typeName, schema);
  }, [typeName, schema]);
};

export default useExtendedSchema;
