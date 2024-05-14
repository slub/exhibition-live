import { JSONSchema7 } from "json-schema";
import { useMemo } from "react";

import schema from "../../public/schema/Kulinarik.schema.json";
import genSlubJSONLDSemanticProperties from "../form/genSlubJSONLDSemanticProperties";
import { prepareStubbedSchema } from "@slub/json-schema-utils";

type UseExtendedSchemaProps = {
  typeName: string;
};

const genSlubRequiredProperties = (_modelName: string) => {
  return ["@type", "@id"];
};

const useExtendedSchema = ({ typeName }: UseExtendedSchemaProps) => {
  return useMemo(() => {
    const prepared = prepareStubbedSchema(
      schema as JSONSchema7,
      genSlubJSONLDSemanticProperties,
      genSlubRequiredProperties,
      {
        excludeType: [
          "InvolvedPerson",
          "InvolvedCorporation",
          "AuthorityEntry",
        ],
        excludeSemanticPropertiesForType: ["AuthorityEntry"],
      },
    );
    const defsFieldName = prepared.definitions ? "definitions" : "$defs";
    const specificModel =
      (prepared[defsFieldName]?.[typeName] as object | undefined) || {};
    const finalSchema = {
      ...(typeof prepared === "object" ? prepared : {}),
      ...specificModel,
    };
    return finalSchema;
  }, [typeName]);
};

export default useExtendedSchema;
