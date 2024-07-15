import { ColumnDesc } from "@slub/edb-core-types";

type ErrorValue = {
  type: CellValueErrorType;
  message: string;
};

type CellValueErrorType =
  /** Corresponds to the #ERROR! error */
  | "ERROR"
  /** Corresponds to the #NULL! error. */
  | "NULL_VALUE"
  /** Corresponds to the #DIV/0 error. */
  | "DIVIDE_BY_ZERO"
  /** Corresponds to the #VALUE! error. */
  | "VALUE"
  /** Corresponds to the #REF! error. */
  | "REF"
  /** Corresponds to the #NAME? error. */
  | "NAME"
  /** Corresponds to the #NUM! error. */
  | "NUM"
  /** Corresponds to the #N/A error. */
  | "N_A"
  /** Corresponds to the Loading... state. */
  | "LOADING";
declare class GoogleSpreadsheetCellErrorValue {
  /**
   * type of the error
   * @see https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/other#ErrorType
   * */
  readonly type: CellValueErrorType;
  /** A message with more information about the error (in the spreadsheet's locale) */
  readonly message: string;
  constructor(rawError: ErrorValue);
}

export type OwnColumnDesc = ColumnDesc<
  string | number | null | boolean | GoogleSpreadsheetCellErrorValue
>;
