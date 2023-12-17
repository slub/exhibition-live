import React, { FunctionComponent, useCallback } from "react";
import { Box, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import Grid2 from "@mui/material/Unstable_Grid2";
import { Login } from "../google/GoogleOAuth";
import { useModifiedRouter } from "../basic";
import { hasGrantedAnyScopeGoogle } from "@react-oauth/google";
import { useGoogleToken } from "../google/useGoogleToken";
import NiceModal from "@ebay/nice-modal-react";
import { GoogleDrivePickerModal } from "../google/GoogleDrivePicker";
import { GoogleSpeadSheetView } from "../google/SpreadSheetView";

const scopes: [string, string] = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
];
export const ImportPage: FunctionComponent = () => {
  const { credentials } = useGoogleToken();
  const router = useModifiedRouter();
  const { documentId } = router.query;

  const hasAccess =
    credentials && hasGrantedAnyScopeGoogle(credentials, ...scopes);
  const openDrivePicker = useCallback(() => {
    NiceModal.show(GoogleDrivePickerModal, {}).then((documentId: string) => {
      console.log(documentId);
      router.push(`/import?documentId=${documentId}`);
    });
  }, [router]);
  return (
    <Box
      sx={{
        padding: { md: "20px 30px 99px 30px" },
      }}
    >
      <Grid2
        container
        justifyContent="space-evenly"
        alignItems="center"
        spacing={3}
        sx={{ p: { md: 10 } }}
      >
        <Grid2 lg={12}>
          <Login scopes={scopes} />
          {hasAccess && <Button onClick={openDrivePicker}>choose file</Button>}
        </Grid2>
        <Grid2 lg={12}>
          {hasAccess && typeof documentId === "string" && (
            <GoogleSpeadSheetView sheetId={documentId} />
          )}
        </Grid2>
      </Grid2>
    </Box>
  );
};
