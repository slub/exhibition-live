import { useGoogleToken } from "./useGoogleToken";
import { useEffect, useMemo, useState } from "react";
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from "google-spreadsheet";
import { useQuery } from "@slub/edb-state-hooks";

export const useGoogleSpreadSheet: (sheetId: string) => {
  loaded: boolean;
  sheetsByIndex: GoogleSpreadsheetWorksheet[];
  sheetsById: Record<number, GoogleSpreadsheetWorksheet>;
  title: string;
  spreadSheet: GoogleSpreadsheet;
} = (sheetId: string) => {
  const { credentials } = useGoogleToken();
  const spreadSheet = useMemo(() => {
    const doc = new GoogleSpreadsheet(sheetId, {
      token: credentials.access_token,
    });
    return doc;
  }, [sheetId, credentials.access_token]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const { data: sheetsData, isLoading: sheetsByIndexLoading } = useQuery(
    ["sheetsByIndex", spreadSheet.spreadsheetId],
    async () => {
      try {
        await spreadSheet.loadInfo();
      } catch (e) {
        console.error("failed to load spreadSheet", e);
        setLoaded(false);
        return;
      }
      setLoaded(true);
      return spreadSheet;
    },
    { refetchOnWindowFocus: true },
  );

  const [title, setTitle] = useState("");
  useEffect(() => {
    try {
      setTitle(spreadSheet.title);
    } catch (e) {
      spreadSheet.loadInfo().then(() => setTitle(spreadSheet.title));
    }
  }, [spreadSheet, setTitle]);
  return {
    spreadSheet,
    sheetsByIndex: sheetsData?.sheetsByIndex,
    sheetsById: sheetsData?.sheetsById,
    loaded,
    title,
  };
};
