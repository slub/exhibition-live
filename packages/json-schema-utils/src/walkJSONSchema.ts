import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { isJSONSchema, isJSONSchemaDefinition } from "./jsonSchema";
import { resolveSchema } from "./resolver";

type WalkerCallbacks = {
  onEnterProperty?: (
    property: string,
    schema: JSONSchema7,
    path: string[],
  ) => boolean | void;
  onExitProperty?: (
    property: string,
    schema: JSONSchema7,
    path: string[],
  ) => void;
  onRef?: (ref: string, schema: JSONSchema7, path: string[]) => boolean | void;
  onObject?: (schema: JSONSchema7, path: string[]) => boolean | void;
  onArray?: (schema: JSONSchema7, path: string[]) => boolean | void;
  onLiteral?: (
    schema: JSONSchema7,
    type: string,
    path: string[],
  ) => boolean | void;
};

type WalkerOptions = {
  maxDepth?: number;
  callbacks?: WalkerCallbacks;
};

export function walkJSONSchema(
  schema: JSONSchema7,
  options: WalkerOptions = {},
  path: string[] = [],
): void {
  const { maxDepth = Infinity, callbacks = {} } = options;

  if (path.length > maxDepth) {
    return;
  }

  if (schema.$ref && callbacks.onRef) {
    if (callbacks.onRef(schema.$ref, schema, path) === false) {
      return;
    }
  }

  if (schema.type === "object" && schema.properties) {
    if (callbacks.onObject && callbacks.onObject(schema, path) === false) {
      return;
    }

    Object.entries(schema.properties).forEach(([property, subSchema]) => {
      if (isJSONSchema(subSchema)) {
        const newPath = [...path, property];

        if (callbacks.onEnterProperty) {
          if (
            callbacks.onEnterProperty(property, subSchema, newPath) === false
          ) {
            return;
          }
        }

        walkJSONSchema(subSchema, options, newPath);

        if (callbacks.onExitProperty) {
          callbacks.onExitProperty(property, subSchema, newPath);
        }
      }
    });
  } else if (schema.type === "array" && schema.items) {
    if (callbacks.onArray && callbacks.onArray(schema, path) === false) {
      return;
    }

    if (isJSONSchemaDefinition(schema.items) && isJSONSchema(schema.items)) {
      walkJSONSchema(schema.items, options, [...path, "items"]);
    }
  } else if (typeof schema.type === "string" && callbacks.onLiteral) {
    callbacks.onLiteral(schema, schema.type, path);
  }
}

export function resolveAndWalkJSONSchema(
  schema: JSONSchema7,
  rootSchema: JSONSchema7,
  options: WalkerOptions = {},
): void {
  const resolvedCallbacks: WalkerCallbacks = {
    ...options.callbacks,
    onRef: (ref, innerSchema, path) => {
      const resolvedSchema = resolveSchema(innerSchema, "", rootSchema);
      if (
        resolvedSchema &&
        isJSONSchemaDefinition(resolvedSchema as JSONSchema7Definition) &&
        isJSONSchema(resolvedSchema as JSONSchema7)
      ) {
        // Check if the current path length is less than maxDepth before walking

        if (!options.maxDepth || path.length < options.maxDepth) {
          walkJSONSchema(resolvedSchema as JSONSchema7, options, path);
        }
      }
      return options.callbacks?.onRef
        ? options.callbacks.onRef(ref, innerSchema, path)
        : undefined;
    },
  };

  walkJSONSchema(schema, { ...options, callbacks: resolvedCallbacks });
}
