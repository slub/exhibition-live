import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from "google-spreadsheet";
import { useGoogleToken } from "./useGoogleToken";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Skeleton,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";

interface OwnProps {
  spreadSheet: GoogleSpreadsheet;
}

type Props = OwnProps;

export const GoogleSpeadSheetWorkSheetView = ({
  workSheet,
}: {
  workSheet: GoogleSpreadsheetWorksheet;
}) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [columns, setColumns] = useState<MRT_ColumnDef<any>[]>([]);
  useEffect(() => {
    (async () => {
      await workSheet.loadCells();
      try {
        const columns = [...Array(workSheet.columnCount)].map((_, index) => {
          const cell = workSheet.getCell(0, index);
          return {
            id: (cell.value ?? "").toString() + index,
            header: (cell.value ?? "").toString(),
            accessorFn: (originalRow, rowIndex) => {
              const dataCell = workSheet.getCell(rowIndex + 1, index);
              return dataCell.value;
            },
          };
        });
        console.log({ columns });
        setColumns(columns as MRT_ColumnDef<any>[]);
      } catch (e) {
        console.log(e);
      }
      setLoaded(true);
    })();
  }, [workSheet, setLoaded]);

  const materialTable = useMaterialReactTable({
    // @ts-ignore
    columns: columns,
    data: [...Array(10)].map((_, index) => index),
    pageCount: Math.ceil(workSheet.rowCount / limit),
    manualPagination: true,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: limit,
      },
    },
  });

  return loaded ? (
    <Box>
      <Typography variant={"h6"}>{workSheet.title}</Typography>
      <Box sx={{ overflow: "auto" }}>
        <MaterialReactTable table={materialTable} />
      </Box>
    </Box>
  ) : (
    <Skeleton height={"300px"} width={"100%"} />
  );
};
export const SpreadSheetView: FunctionComponent<Props> = ({ spreadSheet }) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [selectedSheet, setSelectedSheet] = useState<number>(0);
  useEffect(() => {
    (async () => {
      await spreadSheet.loadInfo();
      setLoaded(true);
    })();
  }, [spreadSheet, setLoaded]);

  return (
    loaded && (
      <>
        title: {spreadSheet.title}
        locale: {spreadSheet.locale}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            maxHeight: "100%",
            overflow: "auto",
          }}
        >
          {selectedSheet}
          <GoogleSpeadSheetWorkSheetView
            key={selectedSheet}
            workSheet={spreadSheet.sheetsByIndex[selectedSheet]}
          />
          <Tabs
            value={selectedSheet}
            onChange={(_e, id) => setSelectedSheet(id)}
          >
            {spreadSheet.sheetsByIndex.map((sheet, index) => {
              return <Tab key={sheet.sheetId} label={sheet.title}></Tab>;
            })}
          </Tabs>
        </Box>
      </>
    )
  );
};

type SpreadSheetViewModalProps = {
  sheetId: string;
};
export const SpreadSheetViewModal = NiceModal.create(
  ({ sheetId }: SpreadSheetViewModalProps) => {
    const modal = useModal();

    const { credentials } = useGoogleToken();
    const spreadSheet = useMemo(() => {
      const doc = new GoogleSpreadsheet(sheetId, {
        token: credentials.access_token,
      });
      return doc;
    }, [sheetId, credentials.access_token]);

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
          <SpreadSheetView spreadSheet={spreadSheet} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => modal.remove()}>Abbrechen</Button>
        </DialogActions>
      </Dialog>
    );
  },
);
