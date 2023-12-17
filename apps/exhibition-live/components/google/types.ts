import { GoogleSpreadsheetCellErrorValue } from "google-spreadsheet";

export type OwnColumnDesc = {
  index: number;
  value: string | number | null | boolean | GoogleSpreadsheetCellErrorValue;
  letter: string;
};
