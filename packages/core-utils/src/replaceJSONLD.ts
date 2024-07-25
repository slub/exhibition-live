/**
 * will recursively look  for @context, @type, @id and replace them with the provided string
 * @param obj the object to replace the values in
 * @param replacement the string to replace the values with (default: "_")
 * @param visited a set of already visited objects to avoid infinite recursion (in doubt leave empty)
 */
export const replaceJSONLD = (
  obj: any,
  replacement: string = "_",
  visited = new WeakSet(),
): any => {
  if (obj && typeof obj === "object") {
    if (visited.has(obj)) {
      return obj; // Avoid infinite recursion by returning already visited objects
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => replaceJSONLD(item, replacement, visited));
    }
    visited.add(obj);

    return Object.fromEntries(
      Object.entries(obj).map(([key, value]: [string, any]) => {
        if (key.startsWith("@")) {
          return [key.replace("@", replacement), value];
        } else {
          return [key, replaceJSONLD(value, replacement, visited)];
        }
      }),
    );
  }
  return obj;
};
