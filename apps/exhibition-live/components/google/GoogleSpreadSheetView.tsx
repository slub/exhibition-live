import React, { FC, useMemo, useState } from "react";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { Box, Grid, Tab, Tabs } from "@mui/material";
import { useQuery } from "@slub/edb-state-hooks";
import { SpreadSheetWorkSheetView } from "./SpreadSheetWorkSheetView";

export type GoogleSpreadSheetViewProps = {
  spreadSheet: GoogleSpreadsheet;
};

export const GoogleSpreadSheetView: FC<GoogleSpreadSheetViewProps> = ({
  spreadSheet,
}) => {
  const [selectedSheet, setSelectedSheet] = useState<number>(0);

  const { data: sheetsByIndexData, isLoading: sheetsByIndexLoading } = useQuery(
    ["sheetsByIndex", spreadSheet.spreadsheetId],
    () => {
      spreadSheet.loadInfo();
      return spreadSheet.sheetsByIndex;
    },
    { refetchOnWindowFocus: true },
  );
  const sheetsByIndex = useMemo(() => {
    return sheetsByIndexData ?? [];
  }, [sheetsByIndexData]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        maxHeight: "100%",
        overflow: "auto",
      }}
    >
      <Grid container spacing={0} sx={{ height: "100%" }} direction={"column"}>
        <Grid item sx={{ display: "flex" }}>
          {!sheetsByIndexLoading && sheetsByIndex[selectedSheet] && (
            <SpreadSheetWorkSheetView
              key={selectedSheet}
              workSheet={sheetsByIndex[selectedSheet]}
              selectedSheet={selectedSheet}
            />
          )}
        </Grid>
        <Grid item>
          <Tabs
            value={selectedSheet}
            onChange={(_e, id) => setSelectedSheet(id)}
          >
            {sheetsByIndex.map((sheet, index) => {
              return <Tab key={sheet.sheetId} label={sheet.title}></Tab>;
            })}
          </Tabs>
        </Grid>
      </Grid>
    </Box>
  );
};
