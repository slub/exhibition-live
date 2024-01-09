import React, { useCallback, useMemo } from "react";
import type { FC } from "react";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  List,
  ListItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useGoogleToken } from "./useGoogleToken";
import { GenericListItem } from "../content/main/GenericVirtualizedList";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { Close as CloseIcon } from "@mui/icons-material";
import { useSettings } from "../state/useLocalSettings";

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
  onPicked: (documentId: string) => void;
};
export const GoogleDrivePicker: FC<GoogleDrivePickerProps> = ({
  onPicked,
  supportedMimeTypes,
}) => {
  const { credentials } = useGoogleToken();
  const { googleDrive } = useSettings();
  const { data: files } = useQuery(
    ["files"],
    async () => {
      const key =
        googleDrive.apiKey ||
        (process.env.NEXT_PUBLIC_GAPI_API_KEY as string | undefined);
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

  const handleOpenDocument = useCallback(
    (file: any) => {
      onPicked(file.id);
    },
    [onPicked],
  );

  return (
    <Box>
      <List>
        {fileList?.map((file: any, index: number) => (
          <ListItem key={file.id}>
            <GenericListItem
              index={index}
              avatar={file.avatar}
              onClick={
                !supportedMimeTypes ||
                supportedMimeTypes.includes(file.mimeType)
                  ? () => handleOpenDocument(file)
                  : undefined
              }
              id={file.id}
              primary={file.name}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export const GoogleDrivePickerModal = NiceModal.create(({}) => {
  const modal = useModal();

  return (
    <Dialog
      open={modal.visible}
      onClose={() => modal.remove()}
      fullWidth={true}
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
          onPicked={(documentId: string) => {
            modal.resolve(documentId);
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