import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
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
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  IconButton,
  List,
  Skeleton,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { mapByConfigFlat } from "../utils/mapping/mapByConfig";
import { spreadSheetMapping } from "../config/spreadSheetMapping";
import { declarativeMappings } from "../config";
import { makeDefaultMappingStrategyContext } from "../form/SimilarityFinder";
import { useGlobalCRUDOptions } from "../state/useGlobalCRUDOptions";
import { encodeIRI, filterUndefOrNull } from "../utils/core";
import { useQuery } from "@tanstack/react-query";
import { OwnColumnDesc } from "./types";
import TypedListItem from "../content/main/TypedListItem";
import {
  defaultJsonldContext,
  defaultPrefix,
  sladb,
  slent,
} from "../form/formConfigs";
import HorizontalNonLinearStepper from "../form/wizard/HorizontalNonLinearStepper";
import { useCRUDWithQueryClient } from "../state/useCRUDWithQueryClient";
import useExtendedSchema from "../state/useExtendedSchema";
import { JSONSchema7 } from "json-schema";
import { useRouter } from "next/router";
import FormControlLabel from "@mui/material/FormControlLabel";

export const index2letter = (index: number): string => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const mod = index % alphabet.length;
  const rest = (index - mod) / alphabet.length;
  const letter = alphabet[mod];
  return rest > 0 ? index2letter(rest) + letter : letter;
};

export type SpreadSheetWorkSheetViewProps = {
  workSheet: GoogleSpreadsheetWorksheet;
};
const typeName = "Exhibition";
const classIRI = sladb.Exhibition.value;
export const GoogleSpeadSheetWorkSheetView: FC<
  SpreadSheetWorkSheetViewProps
> = ({ workSheet }) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [columns, setColumns] = useState<MRT_ColumnDef<any>[]>([]);
  const [reducedColumns, setReducedColumns] = useState<MRT_ColumnDef<any>[]>(
    [],
  );
  const [maxColumns, setMaxColumns] = useState(10);
  const [showTable, setShowTable] = useState(false);
  const [columnDesc, setColumnDesc] = useState<OwnColumnDesc[]>([]);
  const [writeToSpreadSheet, setWriteToSpreadSheet] = useState(false);

  useEffect(() => {
    setReducedColumns(columns.slice(0, maxColumns));
  }, [columns, maxColumns, setReducedColumns]);
  useEffect(() => {
    (async () => {
      await workSheet.loadCells();
      try {
        const cells = [...Array(workSheet.columnCount)].map((_, index) => {
          return workSheet.getCell(0, index);
        });
        const columnDesc_ = cells.map((cell, index) => ({
          index,
          value: cell.value,
          letter: index2letter(index),
        }));
        setColumnDesc(columnDesc_);
        const cols = cells.map((cell, index) => {
          return {
            id: (cell.value ?? "").toString() + index,
            header: (cell.value ?? "").toString(),
            accessorFn: (originalRow, rowIndex) => {
              const dataCell = workSheet.getCell(rowIndex + 1, index);
              return dataCell.value;
            },
          };
        });
        setColumns(cols as MRT_ColumnDef<any>[]);
      } catch (e) {
        console.log(e);
      }
      setLoaded(true);
    })();
  }, [workSheet, setLoaded, setColumnDesc]);

  const fakeData = [...Array(pagination.pageSize)].map((_, index) => index);

  const materialTable = useMaterialReactTable({
    // @ts-ignore
    columns: reducedColumns,
    data: fakeData,
    pageCount: Math.ceil(workSheet.rowCount),
    manualPagination: true,
    // @ts-ignore
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  const { crudOptions } = useGlobalCRUDOptions();
  const loadedSchema = useExtendedSchema({ typeName, classIRI });
  const { saveMutation } = useCRUDWithQueryClient(
    undefined,
    undefined,
    loadedSchema as JSONSchema7,
    defaultPrefix,
    crudOptions,
    defaultJsonldContext,
    { enabled: false },
    "importsave",
    true,
  );
  const [rawMappedData, setRawMappedData] = useState<any[]>([]);
  const locale = useRouter().locale ?? "de";
  const handleMapAndImport = useCallback(async () => {
    const rows = [...Array(pagination.pageSize)].map((_, index) => index + 2);
    setRawMappedData([]);
    for (const row of rows) {
      const targetData = {
        "@id": `${slent().value}${uuidv4()}`,
        "@type": classIRI,
      };
      let mappedData;
      try {
        mappedData = await mapByConfigFlat(
          (col: number | string) => {
            const cell = workSheet.getCell(row, col as number);
            return cell.value as string;
          },
          targetData,
          spreadSheetMapping(columnDesc),
          makeDefaultMappingStrategyContext(
            crudOptions?.selectFetch,
            declarativeMappings,
          ),
        );
      } catch (e) {
        console.warn("failed to map row", row, e);
      }

      if (mappedData) {
        const success = await saveMutation.mutateAsync(mappedData);
        if (success) {
          console.log("success", success);
          setRawMappedData((prev) => [...prev, mappedData]);
          if (writeToSpreadSheet) {
            const idCellColumnIndex = columnDesc.findIndex(
              ({ value }) => value === "exhibition-live IRI",
            );
            const directLinkCellColumnIndex = columnDesc.findIndex(
              ({ value }) => value === "exhibition-live direct link",
            );
            const idCell = workSheet.getCell(row, idCellColumnIndex);
            const directLinkCell = workSheet.getCell(
              row,
              directLinkCellColumnIndex,
            );
            idCell.value = mappedData["@id"];
            idCell.save();
            directLinkCell.value = `https://slub.github.io/exhibition-live/${locale}/create/${typeName}?encID=${encodeIRI(
              mappedData["@id"],
            )}`;
            directLinkCell.save();
          }
        } else {
          console.error("failed");
          if (writeToSpreadSheet) {
            const idCellColumnIndex = columnDesc.findIndex(
              ({ value }) => value === "exhibition-live IRI",
            );
            const idCell = workSheet.getCell(row, idCellColumnIndex);
            idCell.value = "failed";
            idCell.save();
          }
        }
      }
    }
    //setRawMappedData(allMappedData)
  }, [
    workSheet,
    crudOptions,
    pagination.pageSize,
    columnDesc,
    setRawMappedData,
    setRawMappedData,
    locale,
  ]);

  const handleMapping = useCallback(async () => {
    const rows = [...Array(pagination.pageSize)].map((_, index) => index + 2);
    const allMappedData = [];
    for (const row of rows) {
      const targetData = {
        "@id": `${slent().value}${uuidv4()}`,
        "@type": sladb.Exhibition.value,
      };
      const mappedData = await mapByConfigFlat(
        (col: number | string) => {
          const cell = workSheet.getCell(row, col as number);
          return cell.value as string;
        },
        targetData,
        spreadSheetMapping(columnDesc),
        makeDefaultMappingStrategyContext(
          crudOptions?.selectFetch,
          declarativeMappings,
        ),
      );
      allMappedData.push(mappedData);
    }
    setRawMappedData(allMappedData);
  }, [
    workSheet,
    crudOptions,
    pagination.pageSize,
    columnDesc,
    setRawMappedData,
  ]);

  return loaded ? (
    <Box sx={{ flex: 1 }}>
      <Typography variant={"h6"}>{workSheet.title}</Typography>
      <Grid container direction={"row"} spacing={2}>
        <Grid item>
          <TextField
            type={"number"}
            inputProps={{ min: 0, max: columns.length }}
            value={maxColumns}
            onChange={(e) => {
              setMaxColumns(parseInt(e.target.value));
            }}
          />
        </Grid>
        <Grid item>
          {/*make a label for the checkboxes*/}
          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={writeToSpreadSheet}
                  onChange={(e) => setWriteToSpreadSheet(e.target.checked)}
                />
              }
              label={"write to spreadsheet"}
            />
          </FormControl>
          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showTable}
                  onChange={(e) => setShowTable(e.target.checked)}
                />
              }
              label={"show table"}
            />
          </FormControl>
        </Grid>
        <Grid item>
          <Button onClick={handleMapping}>
            Emulate Import - only map data
          </Button>
          <Button onClick={handleMapAndImport}>
            Import {pagination.pageSize} items
          </Button>
        </Grid>
      </Grid>
      <Box sx={{ overflow: "auto" }}>
        <List>
          {rawMappedData.map((mappedData, index) => {
            return (
              <TypedListItem
                key={mappedData["@id"] ?? index}
                index={index}
                data={mappedData}
              />
            );
          })}
        </List>
        {!showTable && (
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {columnDesc.map(({ index, value, letter }) => {
              return (
                <Chip
                  key={index}
                  label={filterUndefOrNull([letter, value]).join(":")}
                  sx={{ margin: "0.2rem" }}
                />
              );
            })}
          </Box>
        )}
        {showTable && <MaterialReactTable table={materialTable} />}
      </Box>
    </Box>
  ) : (
    <Skeleton height={"300px"} width={"100%"} />
  );
};

export type SpreadSheetViewProps = {
  spreadSheet: GoogleSpreadsheet;
};

export const SpreadSheetView: FC<SpreadSheetViewProps> = ({ spreadSheet }) => {
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
    <HorizontalNonLinearStepper
      steps={[
        {
          label: "Select Sheet",
          content: (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                maxHeight: "100%",
                overflow: "auto",
              }}
            >
              <Grid
                container
                spacing={0}
                sx={{ height: "100%" }}
                direction={"column"}
              >
                <Grid item sx={{ display: "flex" }}>
                  {!sheetsByIndexLoading && sheetsByIndex[selectedSheet] && (
                    <GoogleSpeadSheetWorkSheetView
                      key={selectedSheet}
                      workSheet={sheetsByIndex[selectedSheet]}
                    />
                  )}
                </Grid>
                <Grid item>
                  <Tabs
                    value={selectedSheet}
                    onChange={(_e, id) => setSelectedSheet(id)}
                  >
                    {sheetsByIndex.map((sheet, index) => {
                      return (
                        <Tab key={sheet.sheetId} label={sheet.title}></Tab>
                      );
                    })}
                  </Tabs>
                </Grid>
              </Grid>
            </Box>
          ),
        },
        {
          label: "Select Mapping",
          content: (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                maxHeight: "100%",
                overflow: "auto",
              }}
            >
              <Typography variant={"h6"}>Select Mapping</Typography>
            </Box>
          ),
        },
        {
          label: "Select Target",
          content: (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                maxHeight: "100%",
                overflow: "auto",
              }}
            >
              <Typography variant={"h6"}>Select Target</Typography>
            </Box>
          ),
        },
        {
          label: "Review Data",
          content: (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                maxHeight: "100%",
                overflow: "auto",
              }}
            >
              <Typography variant={"h6"}>Review Data</Typography>
            </Box>
          ),
        },
      ]}
    />
  );
};

export type SpreadSheetViewModalProps = {
  sheetId: string;
};

export const useSpreadSheet = (sheetId: string) => {
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
      await spreadSheet.loadInfo();
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
export const SpreadSheetViewModal = NiceModal.create(
  ({ sheetId }: SpreadSheetViewModalProps) => {
    const modal = useModal();
    const { spreadSheet, loaded, title } = useSpreadSheet(sheetId);

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
              {loaded ? title : "loading Spreadsheet ..."}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: "flex" }}>
              <IconButton
                size="large"
                aria-label="close"
                onClick={() => modal.remove()}
                color="inherit"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <DialogContent>
          {loaded ? (
            <SpreadSheetView spreadSheet={spreadSheet} />
          ) : (
            <Skeleton height={"300px"} width={"100%"} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => modal.remove()}>Abbrechen</Button>
        </DialogActions>
      </Dialog>
    );
  },
);

type GoogleSpreadSheetViewProps = {
  sheetId: string;
};
export const GoogleSpeadSheetView: FC<GoogleSpreadSheetViewProps> = ({
  sheetId,
}) => {
  const { spreadSheet, loaded } = useSpreadSheet(sheetId);
  return loaded && <SpreadSheetView spreadSheet={spreadSheet} />;
};
