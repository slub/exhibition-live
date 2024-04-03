export const filterJSONLD = (obj: any, visited = new WeakSet()): any => {
  if (obj && typeof obj === "object") {
    if (Array.isArray(obj)) {
      return obj.map((item) => filterJSONLD(item, visited));
    }
    if (visited.has(obj)) {
      return obj; // Avoid infinite recursion by returning already visited objects
    }
    visited.add(obj);

    return Object.fromEntries(
      Object.entries(obj)
        .filter(([key]: [string, any]) => (key.startsWith("@") ? false : true))
        .map(([key, value]: [string, any]) => [
          key,
          filterJSONLD(value, visited),
        ]),
    );
  }
  return obj;
};
