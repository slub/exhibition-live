export const replaceJSONLD = (obj: any, visited = new WeakSet()): any => {
  if (obj && typeof obj === "object") {
    if (visited.has(obj)) {
      return obj; // Avoid infinite recursion by returning already visited objects
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => replaceJSONLD(item, visited));
    }
    visited.add(obj);

    return Object.fromEntries(
      Object.entries(obj).map(([key, value]: [string, any]) => {
        if (key.startsWith("@")) {
          return [key.replace("@", "_"), value];
        } else {
          return [key, replaceJSONLD(value, visited)];
        }
      }),
    );
  }
  return obj;
};
