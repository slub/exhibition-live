import { resolveObj } from "./resolveObj";

describe("resolveObj", () => {
  test("should return the value at a given path", () => {
    const obj = { a: { b: { c: 1 } } };
    const path = "a.b.c";
    expect(resolveObj(obj, path)).toBe(1);
  });

  test("should return undefined if the path does not exist", () => {
    const obj = { a: { b: { c: 1 } } };
    const path = "a.b.d";
    expect(resolveObj(obj, path)).toBeUndefined();
  });

  test("should return the default value if the path does not exist and a default value is provided", () => {
    const obj = { a: { b: { c: 1 } } };
    const path = "a.b.d";
    const defaultValue = "default";
    expect(resolveObj(obj, path, defaultValue)).toBe("default");
  });

  test("should handle an empty path by returning the original object", () => {
    const obj = { a: 1 };
    const path = "";
    expect(resolveObj(obj, path)).toBe(obj);
  });

  test("should return the default value if the object is null or undefined", () => {
    const path = "a.b.c";
    const defaultValue = "default";
    expect(resolveObj(null, path, defaultValue)).toBe("default");
    expect(resolveObj(undefined, path, defaultValue)).toBe("default");
  });

  test("should return the default value if the path is invalid", () => {
    const obj = { a: { b: { c: 1 } } };
    const path = "a..c";
    const defaultValue = "default";
    expect(resolveObj(obj, path, defaultValue)).toBe("default");
  });
});
