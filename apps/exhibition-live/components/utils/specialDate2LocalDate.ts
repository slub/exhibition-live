import { getDateParts, numeric2JSDate } from "@slub/edb-core-utils";
import dayjs from "dayjs";

export const specialDate2LocalDate = (date: number, locale: string) => {
  const { year, month, day } = getDateParts(date);
  const jsdate = numeric2JSDate(date);
  if (!year) {
    return dayjs(jsdate).format("MM.DD.");
  }
  if (!day && month && year) {
    return dayjs(jsdate).format("YYYY.MM.") + "–-";
  }
  if (day && month && year) {
    return dayjs(jsdate).locale(locale).format("l");
  }
  if (year && !month && !day) {
    return dayjs(jsdate).format("YYYY");
  }
  return "";
};
