import React, { FC } from "react";
import { GoogleSpreadSheetView } from "./GoogleSpreadSheetView";
import { useGoogleSpreadSheet } from "./useGoogleSpreadSheet";

export type GoogleSpreadSheetContainerProps = {
  sheetId: string;
};
export const GoogleSpreadSheetContainer: FC<
  GoogleSpreadSheetContainerProps
> = ({ sheetId }) => {
  const { spreadSheet, loaded } = useGoogleSpreadSheet(sheetId);
  return loaded && <GoogleSpreadSheetView spreadSheet={spreadSheet} />;
};
