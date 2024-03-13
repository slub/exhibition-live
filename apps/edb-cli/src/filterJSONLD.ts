export const filterJSONLD = (obj: any, visited = new WeakSet()) => {
  if (obj && typeof obj === "object") {
    if (visited.has(obj)) {
      return obj; // Avoid infinite recursion by returning already visited objects
    }
    visited.add(obj);

    for (const key in obj) {
      if (key.startsWith("@")) {
        delete obj[key];
      } else {
        filterJSONLD(obj[key], visited);
      }
    }
  }
  return obj;
}
