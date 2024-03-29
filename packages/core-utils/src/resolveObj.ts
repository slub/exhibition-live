/**
 * Resolves the value at the given path of the object.
 *
 * @param {any} obj - The object to query.
 * @param {string} path - The path to the desired value, specified as a string of keys separated by dots.
 * @param {any} [defaultValue] - The value to return if the path does not exist in the object.
 * @returns {any} The value at the specified path or the default value if the path is not found.
 */
export const resolveObj = (obj: any, path: string, defaultValue?: any) =>
  path.length === 0
    ? obj
    : path.split(".").reduce((o, p) => o && o[p], obj) || defaultValue;
