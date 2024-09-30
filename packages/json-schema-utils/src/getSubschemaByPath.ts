import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { isJSONSchema, resolveSchema } from ".";

const processSegment = (
  rootSchema: JSONSchema7,
  schema: JSONSchema7Definition | JSONSchema7Definition[],
  segment: string,
):
  | JSONSchema7Definition
  | JSONSchema7Definition[]
  | JSONSchema7
  | undefined => {
  let currentSubschema:
    | JSONSchema7Definition
    | JSONSchema7Definition[]
    | JSONSchema7
    | undefined = schema;

  if (currentSubschema) {
    if (/^\d+$/.test(segment)) {
      if (
        !Array.isArray(currentSubschema) &&
        isJSONSchema(currentSubschema) &&
        currentSubschema.type === "array" &&
        currentSubschema.items
      ) {
        const index = parseInt(segment, 10);

        currentSubschema = currentSubschema.items;
        if (
          !Array.isArray(currentSubschema) &&
          isJSONSchema(currentSubschema) &&
          currentSubschema.$ref
        ) {
          currentSubschema = resolveSchema(currentSubschema, "", rootSchema) as
            | JSONSchema7Definition
            | JSONSchema7;
        }
        if (
          Array.isArray(currentSubschema) &&
          currentSubschema.length > index
        ) {
          // now we have the case that items of an array are an array of schemas
          currentSubschema = currentSubschema[index];
          if (
            currentSubschema &&
            !Array.isArray(currentSubschema) &&
            isJSONSchema(currentSubschema) &&
            currentSubschema.$ref
          ) {
            const resolvedSchema = resolveSchema(
              currentSubschema,
              "",
              rootSchema,
            ) as JSONSchema7Definition | JSONSchema7;
            if (resolvedSchema && isJSONSchema(resolvedSchema)) {
            }
          }
        }
      }
    } else if (
      !Array.isArray(currentSubschema) &&
      isJSONSchema(currentSubschema) &&
      typeof currentSubschema.properties === "object" &&
      currentSubschema.properties.hasOwnProperty(segment)
    ) {
      currentSubschema = currentSubschema.properties[segment];
    } else if (
      !Array.isArray(currentSubschema) &&
      isJSONSchema(currentSubschema) &&
      currentSubschema.$ref
    ) {
      const resolvedSchema = resolveSchema(currentSubschema, "", rootSchema) as
        | JSONSchema7Definition
        | JSONSchema7;
      if (
        resolvedSchema &&
        isJSONSchema(resolvedSchema) &&
        resolvedSchema.properties &&
        resolvedSchema.properties.hasOwnProperty(segment)
      ) {
        currentSubschema = resolvedSchema.properties[segment];
      }
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
  if (
    currentSubschema &&
    !Array.isArray(currentSubschema) &&
    isJSONSchema(currentSubschema) &&
    currentSubschema.$ref
  ) {
    const resolvedSchema = resolveSchema(currentSubschema, "", rootSchema) as
      | JSONSchema7Definition
      | JSONSchema7;
    if (resolvedSchema && isJSONSchema(resolvedSchema)) {
      currentSubschema = resolvedSchema;
    }
  }
  return currentSubschema;
};

/**
 * checks a schema  for a given path to exist and outputs its schema
 *
 * if the path does not exist, it returns undefined
 *
 * @param schema
 * @param path
 */
export const getSubschemaByPath = (
  schema: JSONSchema7,
  path: string,
):
  | JSONSchema7Definition
  | JSONSchema7Definition[]
  | JSONSchema7
  | undefined => {
  const pathSegments = path.split(".");
  let currentSubschema:
    | JSONSchema7Definition[]
    | JSONSchema7
    | JSONSchema7Definition
    | undefined = schema;

  for (const segment of pathSegments) {
    if (!currentSubschema) {
      return undefined;
    }

    currentSubschema = processSegment(schema, currentSubschema, segment);
  }

  return currentSubschema;
};
