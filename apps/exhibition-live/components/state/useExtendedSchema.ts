import { useMemo } from "react";
import { useAdbContext } from "@slub/edb-state-hooks";
import { JSONSchema7 } from "json-schema";
import {
  bringDefinitionToTop,
  prepareStubbedSchema,
} from "@slub/json-schema-utils";
import { StringToIRIFn } from "@slub/edb-core-types";

type UseExtendedSchemaProps = {
  typeName: string;
};
const defaultMakeStubSchema = (
  schema: JSONSchema7,
  typeNameToTypeIRI: StringToIRIFn,
) => {
  return prepareStubbedSchema(
    schema,
    (modelName) => ({
      "@type": {
        const: typeNameToTypeIRI(modelName.replace(/Stub$/, "")),
        type: "string",
      },
      "@id": {
        type: "string",
      },
    }),
    () => ["@type", "@id"],
  );
};
const useExtendedSchema = ({ typeName }: UseExtendedSchemaProps) => {
  const { schema, typeNameToTypeIRI, makeStubSchema } = useAdbContext();
  return useMemo(() => {
    const defaultFn = (schema: JSONSchema7) =>
      defaultMakeStubSchema(schema, typeNameToTypeIRI);
    const prepareSchema = makeStubSchema || defaultFn;
    return bringDefinitionToTop(prepareSchema(schema), typeName);
  }, [typeName, schema, makeStubSchema, typeNameToTypeIRI]);
};

export default useExtendedSchema;
