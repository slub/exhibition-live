import { useGoogleToken } from "./useGoogleToken";
import { useEffect, useMemo, useState } from "react";
import { GoogleSpreadsheet } from "google-spreadsheet";

export const useGoogleSpreadSheet = (sheetId: string) => {
  const { credentials } = useGoogleToken();
  const spreadSheet = useMemo(() => {
    const doc = new GoogleSpreadsheet(sheetId, {
      token: credentials.access_token,
    });
    return doc;
  }, [sheetId, credentials.access_token]);
  const [loaded, setLoaded] = useState<boolean>(false);
  useEffect(() => {
    (async () => {
      try {
        await spreadSheet.loadInfo();
      } catch (e) {
        console.error("failed to load spreadSheet", e);
        setLoaded(false);
        return;
      }
      setLoaded(true);
    })();
  }, [spreadSheet, setLoaded]);

  const [title, setTitle] = useState("");
  useEffect(() => {
    try {
      setTitle(spreadSheet.title);
    } catch (e) {
      spreadSheet.loadInfo().then(() => setTitle(spreadSheet.title));
    }
  }, [spreadSheet, setTitle]);
  return { spreadSheet, loaded, title };
};
