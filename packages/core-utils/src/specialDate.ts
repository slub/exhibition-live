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
