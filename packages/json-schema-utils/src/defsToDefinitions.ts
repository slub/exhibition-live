/**
 * Lower level helper function for ${@link convertDefsToDefinitions}
 *
 * convert $defs to definitions and all the references in the given types.
 * @param obj
 * @param visited
 */
export const defsToDefinitions = (obj: any, visited = new WeakSet()): any => {
  if (obj && typeof obj === "object") {
    if (visited.has(obj)) {
      return obj; // Avoid infinite recursion by returning already visited objects
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => defsToDefinitions(item, visited));
    }
    visited.add(obj);

    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        if (key === "$ref" && typeof value === "string") {
          return [key, value.replace("#/$defs", "#/definitions")];
        } else {
          return [key, defsToDefinitions(value, visited)];
        }
      }),
    );
  }
  return obj;
};

/**
 * Convert the $defs key to definitions in the given JSON schema.
 *
 * for instance if for some reason an external json-schema tool or method does not support $defs, this function can be used to convert $defs to definitions.
 * @param schema
 */
export const convertDefsToDefinitions = <T extends object>(schema: T) => {
  if (!schema["$defs"]) return schema;
  const { $defs: definitions, ...rest } = defsToDefinitions(schema);
  return {
    ...rest,
    definitions,
  } as T;
};
