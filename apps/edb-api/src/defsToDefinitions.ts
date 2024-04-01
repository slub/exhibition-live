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
