import { JSONSchema7 } from "json-schema";
import { extendDefinitionsWithProperties } from "./stubHelper";

/**
 * this is a helper function to facilitate the creation of
 * semantic Properties type and id.
 *
 * By passing a `schema` all definitions are extended with an `@id`
 * and a `@type` property. By setting the typeKey and idKey explicitly
 * one can alter that behavior to other keyNames
 *
 * @param schema
 * @param typeKey
 * @param idKey
 */
export const extendSchemaShortcut = (
  schema: any,
  typeKey: string = "@type",
  idKey: string = "@id",
): JSONSchema7 => {
  return extendDefinitionsWithProperties(
    schema,
    (_) =>
      ({
        [typeKey]: {
          type: "string",
        },
        [idKey]: {
          type: "string",
        },
      }) as JSONSchema7["properties"],
    (_) => [typeKey, idKey],
  );
};
