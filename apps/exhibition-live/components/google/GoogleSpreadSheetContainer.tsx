import React, { FC } from "react";
import { useGoogleSpreadSheet } from "./useGoogleSpreadSheet";
import { Box } from "@mui/material";
import { SpreadSheetWorkSheetView } from "./SpreadSheetWorkSheetView";

export type GoogleSpreadSheetContainerProps = {
  documentId: string;
  sheetId: number;
  mappingId: string;
};
export const GoogleSpreadSheetContainer: FC<
  GoogleSpreadSheetContainerProps
> = ({ documentId, sheetId, mappingId }) => {
  const { sheetsById, loaded } = useGoogleSpreadSheet(documentId);
  return (
    loaded && (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          maxHeight: "100%",
          overflow: "auto",
        }}
      >
        <SpreadSheetWorkSheetView
          workSheet={sheetsById[sheetId]}
          mappingId={mappingId}
        />
      </Box>
    )
  );
};
