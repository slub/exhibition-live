import { filterUndefOrNull } from "@slub/edb-core-utils";
import merge from "lodash/merge";

export const splitUpLoDashConnectedEntry = (str: string, value: any) => {
  const parts = str.split(".");
  //make an object like parts[0]: { part[1]: { part[2]: { part[3]: ... } } }
  return parts.reduceRight((acc, part, index) => ({ [part]: acc }), value);
};
export const toJSONLD = (obj: any, visited = new WeakSet()): any => {
  if (obj && typeof obj === "object") {
    if (visited.has(obj)) {
      return obj; // Avoid infinite recursion by returning already visited objects
    }
    visited.add(obj);
    if (Array.isArray(obj) && obj.length > 1) {
      return obj.map((item) => toJSONLD(item, visited));
    }

    const specialEntries = Object.entries(obj)
      .filter(([key, value]) => key.includes(".") && value !== null)
      .map(([key, value]: [string, any]) => {
        return toJSONLD(splitUpLoDashConnectedEntry(key, value), visited);
      });
    const normalEntries = Object.fromEntries(
      filterUndefOrNull(
        Object.entries(obj)
          .filter(([key, value]) => !key.includes(".") && value !== null)
          .map(([key, value]: [string, any]) => {
            let v = value;
            if (Array.isArray(value) && value.length > 1) {
              v = Array.from(new Set(value));
            }
            if (Array.isArray(v) && v.length === 1) {
              v = v[0];
            }
            if (key === "_id" || key === "_type") {
              return [key.replace("_", "@"), v];
            } else {
              return [key, toJSONLD(v, visited)];
            }
          }),
      ),
    );
    return merge(normalEntries, ...specialEntries);
  }
  return obj;
};
