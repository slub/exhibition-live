import { filterUndefOrNull } from "@slub/edb-core-utils";
import merge from "lodash/merge";

export const splitUpLoDashConnectedEntry = (str: string, value: any) => {
  const parts = str.split("_");
  //make an object like parts[0]: { part[1]: { part[2]: { part[3]: ... } } }
  return parts.reduceRight((acc, part, index) => ({ [part]: acc }), value);
};

/**
 * Converts an object to JSON-LD format by converting keys with underscores to nested objects and
 * mapping `id` and `type` attribute to `@id` and `@type` respectively.
 *
 * @param obj the object to convert
 * @param visited due to the possibility of circular references, this function uses a WeakSet to keep track of visited objects
 */
export const toJSONLD = (obj: any, visited = new WeakSet()): any => {
  if (obj && typeof obj === "object") {
    if (visited.has(obj)) {
      return obj; // Avoid infinite recursion by returning already visited objects
    }
    visited.add(obj);
    if (Array.isArray(obj)) {
      return obj.map((item) => toJSONLD(item, visited));
    }

    const specialEntries = Object.entries(obj)
      .filter(([key, value]) => key.includes("_") && value !== null)
      .map(([key, value]: [string, any]) => {
        return splitUpLoDashConnectedEntry(key, value);
      });
    const normalEntries = Object.fromEntries(
      filterUndefOrNull(
        Object.entries(obj)
          .filter(([key, value]) => !key.includes("_") && value !== null)
          .map(([key, value]: [string, any]) => {
            if (key === "id" || key === "type") {
              return [`@${key}`, value];
            } else {
              return [key, toJSONLD(value, visited)];
            }
          }),
      ),
    );
    return merge(normalEntries, ...specialEntries);
  }
  return obj;
};
