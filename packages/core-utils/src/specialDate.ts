import { leftpad } from "./leftpad";

/**
 * Extracts a specified part of the date from a given numeric date representation.
 *
 * @param {number} date - The numeric date (e.g., 20210901 for September 1, 2021).
 * @param {"day" | "month" | "year"} part - The part of the date to extract ("day", "month", or "year").
 * @returns {number} The extracted part of the date as a number, or 0 if an error occurs.
 */
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

const nanToNull = (value: number) => (isNaN(value) ? null : value);

export type DateParts = {
  year: number | null;
  month: number | null;
  day: number | null;
};
export const getDateParts = (date: number) => {
  const strDate = leftpad(date, 8);
  const year = Number(strDate.substring(0, 4)),
    month = Number(strDate.substring(4, 6)),
    day = Number(strDate.substring(6, 8));
  return {
    year: nanToNull(year),
    month: nanToNull(month),
    day: nanToNull(day),
  };
};

/**
 * Returns a specified part of the date from a given numeric date representation, padded with leading zeros if necessary.
 *
 * @param {number} date - The numeric date (e.g., 20210901 for September 1, 2021).
 * @param {"day" | "month" | "year"} part - The part of the date to extract and pad ("day", "month", or "year").
 * @returns {string} The extracted and padded part of the date as a string.
 */
export const getPaddedDatePart = (
  date: number,
  part: "day" | "month" | "year",
) => {
  const value = getDatePart(date, part);
  const maxLength = part === "year" ? 4 : 2;
  return leftpad(value, maxLength);
};

/**
 * Returns a JavaScript Date object from a given numeric date representation.
 * if no day is given, the first day of the month is assumed.
 * if no month is given, January is assumed.
 * @param date
 */
export const getJSDate: (date: number) => Date = (date) => {
  const day = getDatePart(date, "day") || 1;
  const month = getDatePart(date, "month") || 1;
  const year = getDatePart(date, "year");
  return new Date(year, month - 1, day);
};

/**
 * Formats a JavaScript Date object into a string of format YYYYMMDD, with each part padded as necessary.
 *
 * @param {Date} date - The Date object to format.
 * @returns {string} The formatted date as a string in YYYYMMDD format.
 */
export const getPaddedDate = (date: Date) => {
  const year = leftpad(date.getFullYear(), 4);
  const month = leftpad(date.getMonth() + 1, 2);
  const day = leftpad(date.getDate(), 2);
  return `${year}${month}${day}`;
};

/**
 * convert a number to a string with a given length, pad it with zeros
 * @param date the date as number between 0 and 99999999
 * @param part the part of the date to extract ("day", "month", or "year")
 */
export const getDatePartAsString = (
  date: number,
  part: "day" | "month" | "year",
) => {
  const value = getDatePart(date, part);
  if (value === 0) return "";
  const maxLength = part === "year" ? 4 : 2;
  return leftpad(value, maxLength);
};

/**
 * convert year, month, day to a number
 * @param year
 * @param month
 * @param day
 * @returns
 */
export const makeSpecialDate = (
  year: number,
  month?: number | undefined,
  day?: number | undefined,
) => {
  const specialDateString = `${year}${month ? leftpad(month, 2) : "00"}${day ? leftpad(day, 2) : "00"}`;
  return Number(specialDateString);
};
