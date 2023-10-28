import { JSONSchema7 } from "json-schema";
import { useMemo } from "react";

import schema from "../../public/schema/Exhibition.schema.json";
import genSlubJSONLDSemanticProperties from "../form/genSlubJSONLDSemanticProperties";
import { prepareStubbedSchema } from "./stubHelper";

type UseExtendedSchemaProps = {
  typeName: string;
  classIRI: string;
};

const useExtendedSchema = ({ typeName, classIRI }: UseExtendedSchemaProps) => {
  //const {data: loadedSchema} = useQuery(['schema', typeName], () => fetch(`/schema/${typeName}.schema.json`).then(async res => {
  return useMemo(() => {
    const prepared = prepareStubbedSchema(
      schema as JSONSchema7,
      genSlubJSONLDSemanticProperties,
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
  }, [typeName, classIRI]);
};

export default useExtendedSchema;
