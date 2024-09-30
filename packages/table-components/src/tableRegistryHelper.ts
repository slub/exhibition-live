import get from "lodash-es/get";
import { isControl, Tester } from "@jsonforms/core";
import { isPrimitive } from "@slub/json-schema-utils";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { FieldExtractDeclaration } from "@slub/edb-core-types";
import { TFunction } from "i18next";
import { MRT_ColumnDef } from "material-react-table";

export const pathToString = (path: string[]) => path.join("_");

type PathKeyMap = {
  [key: string]: {
    path: string;
    defaultValue?: any;
  };
};
export const mkAccessor =
  (path: string, defaultValue?: string | any, fn?: (v: any) => any) =>
  (row: any) => {
    const raw = get(row, path, defaultValue || "");
    return fn ? fn(raw) : raw;
  };
export const urlSuffix = (uri: string) => {
  return uri.substring(
    (uri.includes("#") ? uri.lastIndexOf("#") : uri.lastIndexOf("/")) + 1 ?? 0,
    uri.length,
  );
};
export const mkMultiAccessor = (pathKeysMap: PathKeyMap) => (row: any) => {
  return Object.fromEntries(
    Object.entries(pathKeysMap).map(([key, { path, defaultValue }]) => [
      key,
      get(row, path, defaultValue || ""),
    ]),
  );
};
export const extractSingleFieldIfString = (
  entry: any | null,
  fieldExtractDeclaration: FieldExtractDeclaration,
): string | null => {
  try {
    if (typeof fieldExtractDeclaration !== "string") {
      return null;
    }
    const value = entry[`${fieldExtractDeclaration}_single`]?.value;
    if (typeof value !== "string") {
      return null;
    } else {
      return value;
    }
  } catch (e) {
    return null;
  }
};
/**
 * generates Column Definition stub with header, id and accessorFn for a single value column
 *
 * each part  will look like `path_to_key_single`
 * translation needs to be provided in the form of `path_to_key` using the t-function
 *
 * @param path path to the key (empty array for root)
 * @param key last part of the path
 * @param t translation function
 */
export const singleValueColumnStub: (
  path: string[],
  key: string,
  t: TFunction,
  label?: string,
) => Pick<MRT_ColumnDef<any>, "header" | "id" | "accessorFn"> = (
  path,
  key,
  t,
  label,
) => ({
  header: label || t(pathToString([...path, key])),
  id: pathToString([...path, key, "single"]),
  accessorFn: mkAccessor(`${pathToString([...path, key, "single"])}.value`, ""),
});
export const isPrimitiveControl: Tester = (_, schema) =>
  typeof schema.type === "string" && isPrimitive(schema.type);
export const isObjectWithRefControl: Tester = (uischema, schema) =>
  schema.$ref && isControl(uischema);
export const titleOf = (schema: JSONSchema7Definition) =>
  (schema as JSONSchema7)?.title;
