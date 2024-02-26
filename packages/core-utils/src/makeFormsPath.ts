import { filterUndefOrNull } from "./filterUndefOrNull";

export const makeFormsPath = (
  path: string | undefined,
  ...childPath: string[]
) => filterUndefOrNull([path, ...childPath]).join(".");
