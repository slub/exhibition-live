import { leftpad } from "./leftpad";

export const getDatePart = (date: number, part: "day" | "month" | "year") => {
  try {
    const strDate = leftpad(date, 8);
    const pos = part === "day" ? 6 : part === "month" ? 4 : 0;
    const length = part === "year" ? 4 : 2;
    return Number(strDate.substring(pos, pos + length));
  } catch (e) {
    return 0;
  }
};

export const getPaddedDatePart = (
  date: number,
  part: "day" | "month" | "year",
) => {
  const value = getDatePart(date, part);
  const maxLength = part === "year" ? 4 : 2;
  return leftpad(value, maxLength);
};

export const getPaddedDate = (date: Date) => {
  const year = leftpad(date.getFullYear(), 4);
  const month = leftpad(date.getMonth() + 1, 2);
  const day = leftpad(date.getDate(), 2);
  return `${year}${month}${day}`;
};
