import React, { useCallback, useMemo, useState } from "react";
import type { FC } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { useQuery } from "@slub/edb-state-hooks";
import { useGoogleToken } from "./useGoogleToken";
import { Close as CloseIcon } from "@mui/icons-material";
import { useSettings } from "@slub/edb-state-hooks";
import { useGoogleOAuth } from "@react-oauth/google";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { GenericMaterialListItem } from "@slub/edb-virtualized-components";
import { useGoogleSpreadSheet } from "./useGoogleSpreadSheet";
import { mappingsAvailable } from "./mappingsAvailable";
import { useTranslation } from "next-i18next";

const googleApiURL = "https://content.googleapis.com/drive/v3/files";
const mimeIconsBase =
  "https://raw.githubusercontent.com/pasnox/oxygen-icons-png/master/";
const theme = "oxygen";
const mimeMap = {
  "application/vnd.google-apps.folder": "inode/directory",
  "application/vnd.google-apps.document": "application/msword",
  "application/vnd.google-apps.spreadsheet": "application/vnd.ms-excel",
  "video/quicktime": "video/x-generic",
  "audio/mpeg": "audio/x-generic",
};
const getMimeIcon = (mimeType: string, size: number = 128) => {
  if (mimeMap[mimeType]) {
    mimeType = mimeMap[mimeType];
  }
  const splitted = mimeType.split("/");
  const type = splitted[0];
  const subtype = splitted[1];
  return `${mimeIconsBase}${theme}/${size}x${size}/mimetypes/${type}-${subtype}.png`;
};

type GoogleDrivePickerProps = {
  supportedMimeTypes?: string[];
  onPicked: (documentId: string, sheetId: number, mappingId: string) => void;
};
export const GoogleDrivePicker: FC<GoogleDrivePickerProps> = ({
  onPicked,
  supportedMimeTypes,
}) => {
  const { credentials } = useGoogleToken();
  const { googleDrive } = useSettings();
  const { clientId } = useGoogleOAuth();
  const { t } = useTranslation();
  const { data: files } = useQuery(
    ["files"],
    async () => {
      const key = clientId || googleDrive?.apiKey;
      if (!key) {
        throw new Error("No API Key provided");
      }
      const queryParameters = {
        corpus: "user",
        includeItemsFromAllDrives: true,
        includeTeamDriveItems: true,
        pageSize: 100,
        supportsAllDrives: true,
        supportsTeamDrives: true,
        key,
      };

      const url = new URL(googleApiURL);
      // @ts-ignore
      url.search = new URLSearchParams(queryParameters).toString();
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${credentials?.access_token}`,
        },
      });
      return response.json();
    },
    { enabled: !!credentials?.access_token },
  );

  const fileList = useMemo(() => {
    return files?.files?.map((file: any) => ({
      ...file,
      avatar: getMimeIcon(file.mimeType),
    }));
  }, [files]);

  const [selectedFileID, setSelectedFileID] = useState<string | undefined>();

  const { sheetsByIndex, loaded } = useGoogleSpreadSheet(selectedFileID);

  const [selectedSheetID, setSelectedSheetID] = useState<number | undefined>(0);

  const handleSelectFile = useCallback(
    (file: any) => {
      setSelectedSheetID(undefined);
      setSelectedFileID(file.id);
    },
    [setSelectedFileID, setSelectedSheetID],
  );
  const handleSelectSheet = useCallback(
    (sheetID: number) => {
      setSelectedSheetID(sheetID);
    },
    [setSelectedSheetID],
  );
  const handleOpenDocument = useCallback(
    (mappingId: string) => {
      onPicked(selectedFileID, selectedSheetID, mappingId);
    },
    [onPicked, selectedFileID, selectedSheetID],
  );

  return (
    <Grid container justifyContent="left" direction={"row"} spacing={2}>
      <Grid item xs={2}>
        <Typography variant="h4">{t("Files")}</Typography>
        <List>
          {fileList?.map((file: any, index: number) => (
            <ListItem key={file.id}>
              <GenericMaterialListItem
                index={index}
                avatar={file.avatar}
                listItemButtonProps={{
                  selected: selectedFileID === file.id,
                }}
                onClick={
                  !supportedMimeTypes ||
                  supportedMimeTypes.includes(file.mimeType)
                    ? () => handleSelectFile(file)
                    : undefined
                }
                id={file.id}
                primary={file.name}
              />
            </ListItem>
          ))}
        </List>
      </Grid>
      {selectedFileID && sheetsByIndex.length > 0 && (
        <Grid item xs={2}>
          <Typography variant="h4">{t("Worksheets")}</Typography>
          <List>
            {sheetsByIndex.map((sheet, index) => (
              <ListItemButton
                selected={sheet.sheetId === selectedSheetID}
                key={sheet.sheetId + index}
                onClick={() => handleSelectSheet(sheet.sheetId)}
              >
                <ListItemAvatar>
                  <Avatar variant={"rounded"} aria-label="Index">
                    {index + 1}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText>{sheet.title}</ListItemText>
              </ListItemButton>
            ))}
          </List>
        </Grid>
      )}
      {selectedFileID && selectedSheetID !== undefined && (
        <Grid item xs={2}>
          <Typography variant="h4">{t("Mappings")}</Typography>
          <List>
            {mappingsAvailable.map((key, index) => (
              <ListItemButton key={key} onClick={() => handleOpenDocument(key)}>
                <ListItemAvatar>
                  <Avatar variant={"rounded"} aria-label="Index">
                    {index + 1}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText>{key}</ListItemText>
              </ListItemButton>
            ))}
          </List>
        </Grid>
      )}
    </Grid>
  );
};

export const GoogleDrivePickerModal = NiceModal.create(({}) => {
  const modal = useModal();

  return (
    <Dialog
      open={modal.visible}
      onClose={() => modal.remove()}
      fullWidth={true}
      maxWidth={false}
      scroll={"paper"}
      disableScrollLock={false}
    >
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="h6" color="inherit" component="div">
            Select Files from Google Drive
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex" }}>
            <IconButton
              size="large"
              aria-label="close without saving"
              onClick={() => modal.remove()}
              color="inherit"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <GoogleDrivePicker
          onPicked={(documentId: string, sheetId, mappingId) => {
            modal.resolve({ documentId, sheetId, mappingId });
            modal.remove();
          }}
          supportedMimeTypes={["application/vnd.google-apps.spreadsheet"]}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => modal.remove()}>Abbrechen</Button>
      </DialogActions>
    </Dialog>
  );
});
