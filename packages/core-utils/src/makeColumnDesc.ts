import { ColumnDesc } from "@slub/edb-core-types";
import { index2letter } from "./index2letter";
export const makeColumnDesc: <T>(cells: T[]) => ColumnDesc<T>[] = (cells) =>
  cells.map((value, index) => ({
    index,
    value,
    letter: index2letter(index),
  }));
