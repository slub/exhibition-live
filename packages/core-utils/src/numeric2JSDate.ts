import { getJSDate } from "./specialDate";

export const numeric2JSDate: (value: number | string) => number | Date = (
  value: number | string,
) => {
  const numericDate = typeof value === "string" ? parseInt(value) : value;
  if (isNaN(numericDate)) {
    return 0;
  }
  return getJSDate(numericDate);
};
