import { getDateParts, numeric2JSDate } from "@slub/edb-core-utils";
import dayjs from "dayjs";

export const specialDate2LocalDate = (date: number, locale: string) => {
  const { year, month, day } = getDateParts(date);
  const jsdate = numeric2JSDate(date);
  if (!year && month && day) {
    return locale === "de"
      ? dayjs(jsdate).format("DD.MM.")
      : dayjs(jsdate).format("MM/DD");
  }
  if (!day && month && year) {
    return locale === "de"
      ? dayjs(jsdate).format("MMMM YYYY")
      : dayjs(jsdate).format("MMMM/YYYY");
  }
  if (day && month && year) {
    return locale === "de"
      ? dayjs(jsdate).format("DD.MM.YYYY")
      : dayjs(jsdate).format("MM/DD/YYYY");
  }
  if (year && !month && !day) {
    return dayjs(jsdate).format("YYYY");
  }
  return "";
};
