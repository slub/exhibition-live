import isEmpty from "lodash/isEmpty";
import get from "lodash/get"
import { JsonSchema } from "./types";
import {decode} from "./jsonPointer";
import {JSONSchema7} from "json-schema";

const invalidSegment = (pathSegment: string) =>
  pathSegment === '#' || pathSegment === undefined || pathSegment === '';

/**
 * Resolve the given schema path in order to obtain a subschema.
 * @param {JsonSchema} schema_ the root schema from which to start
 * @param {string} schemaPath the schema path to be resolved
 * @param {JsonSchema} rootSchema the actual root schema
 * @returns {JsonSchema} the resolved sub-schema
 */
export const resolveSchema = (
  schema: JsonSchema,
  schemaPath: string,
  rootSchema: JsonSchema
): JsonSchema | undefined => {
  const segments = schemaPath?.split('/').map(decode);
  return resolveSchemaWithSegments(schema, segments, rootSchema);
};

const resolveSchemaWithSegments = (
  schema_: JsonSchema,
  pathSegments: string[],
  rootSchema: JsonSchema
): JsonSchema | undefined => {
  if (isEmpty(schema_)) {
    return undefined;
  }

  let schema: JsonSchema |  undefined = schema_

  if (schema.$ref) {
    schema = resolveSchema(rootSchema, schema.$ref, rootSchema);
  }

  if (!pathSegments || pathSegments.length === 0) {
    return schema;
  }

  const [segment, ...remainingSegments] = pathSegments;

  if (invalidSegment(segment) && schema) {
    return resolveSchemaWithSegments(schema, remainingSegments, rootSchema);
  }

  const singleSegmentResolveSchema = get(schema, segment);

  const resolvedSchema = resolveSchemaWithSegments(
    singleSegmentResolveSchema,
    remainingSegments,
    rootSchema
  );
  if (resolvedSchema) {
    return resolvedSchema;
  }

  if (segment === 'properties' || segment === 'items') {
    // Let's try to resolve the path, assuming oneOf/allOf/anyOf/then/else was omitted.
    // We only do this when traversing an object or array as we want to avoid
    // following a property which is named oneOf, allOf, anyOf, then or else.
    let alternativeResolveResult = undefined;

    if(!schema)
      return undefined

    const subSchemas = [].concat(
      // @ts-ignore
      schema.oneOf ?? [],
      schema.allOf ?? [],
      schema.anyOf ?? [],
      (schema as JSONSchema7).then ?? [],
      (schema as JSONSchema7).else ?? []
    );

    for (const subSchema of subSchemas) {
      // @ts-ignore
      alternativeResolveResult = resolveSchemaWithSegments(
        subSchema,
        [segment, ...remainingSegments],
        rootSchema
      );
      if (alternativeResolveResult) {
        break;
      }
    }
    return alternativeResolveResult;
  }

  return undefined;
};
