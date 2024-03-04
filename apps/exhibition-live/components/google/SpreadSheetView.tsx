import React, {FC, useCallback, useEffect, useMemo, useRef, useState} from "react";
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
  DialogContent, Divider,
  FormControl,
  Grid,
  IconButton,
  List, Menu, MenuItem, Select,
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
import {ConcreteSpreadSheetMapping, spreadSheetMappings} from "../config/spreadSheetMappings";
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
import {DeclarativeFlatMapping, DeclarativeFlatMappings, DeclarativeMapping} from "../utils/mapping/mappingStrategies";
import {useTranslation} from "next-i18next";
import {NiceMappingConfigurationDialog} from "../mapping/NiceMappingConfigurationDialog";
import {
  DeclarativeMatchBasedFlatMapping,
  DeclarativeMatchBasedFlatMappings
} from "../utils/mapping/mapMatchBasedByConfig";

type GoogleSpreadSheetTableProps = {
  workSheet: GoogleSpreadsheetWorksheet;
  columnIndicies: number[];
}

export const GoogleSpreadSheetTable: FC<GoogleSpreadSheetTableProps> = ({workSheet, columnIndicies}) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [columns, setColumns] = useState<MRT_ColumnDef<any>[]>([]);
  const [columnDesc, setColumnDesc] = useState<OwnColumnDesc[]>([]);
  const reducedColumns = useMemo(() => {
    return columns.filter((column, index) => columnIndicies.includes(index))
  }, [columns, columnIndicies]);

  useEffect(() => {
    (async () => {
      /*try {
        await workSheet.loadCells();
      } catch (e) {
        console.error("failed to load cells", e)
        setLoaded(false)
        return
      }*/
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

  return loaded ? (
    <Box>
      <MaterialReactTable table={materialTable} />
    </Box>
  ) : (
    <Skeleton height={"300px"} width={"100%"} />
  );

}


type ColumnChipProps = {
  columnIndex: number
  columnLetter: string
  columnDesc: OwnColumnDesc[]
  value: any
  label: string
  spreadSheetMapping?: DeclarativeFlatMappings
  rawMapping?: DeclarativeMatchBasedFlatMappings
  workSheet: GoogleSpreadsheetWorksheet
}
const ColumnChip = ({label, columnIndex,  columnLetter, columnDesc, spreadSheetMapping, rawMapping, workSheet}: ColumnChipProps) => {
  const { t } = useTranslation()

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const columnMapping = useMemo(() =>
    spreadSheetMapping?.filter(mapping =>
      //@ts-ignore
      Boolean(mapping.source.columns.find((col) =>
        typeof col === 'string' ? col === columnLetter : col === columnIndex
  ))) || [], [spreadSheetMapping, columnIndex,  columnLetter]);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAssignMapping = useCallback(() => {

  }, []);
  const handleOpenMapping = useCallback((mappingDecl: DeclarativeFlatMapping, rawMapping?: DeclarativeMatchBasedFlatMapping) => {
    NiceModal.show(NiceMappingConfigurationDialog, {
      mapping: mappingDecl,
      rawMapping,
      sourcePath: columnIndex,
      fields: columnDesc,
      tablePreview: (mapping: DeclarativeFlatMapping) => {
        return <GoogleSpreadSheetTable workSheet={workSheet} columnIndicies={mapping.source.columns as number[]} />
      }
    })
  }, [columnIndex, workSheet, columnDesc]);


  return <>
    <Chip
      label={label}
      color={columnMapping.length > 0 ? "primary" : undefined }
      sx={{ margin: "0.2rem" }}
      onClick={handleClick}
    />
    <Menu
      id="lock-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        'aria-labelledby': 'lock-button',
        role: 'listbox',
      }}
    >
        <MenuItem
          key={'option1'}
          onClick={handleAssignMapping}
        >
          {t("assign mapping")}
        </MenuItem>
        <Divider />
      {columnMapping.map((mapping, index) => {
        const raw = rawMapping?.find(rawMappingDecl => rawMappingDecl.id === mapping.id )
        return <MenuItem
          key={index}
          onClick={() => handleOpenMapping(mapping, raw)}
        >
          {t("open Mapping", {index: index + 1})}
        </MenuItem>
      })
      }
    </Menu>
  </>
}

export const index2letter = (index: number): string => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const mod = index % alphabet.length;
  const rest = (index - mod) / alphabet.length;
  const letter = alphabet[mod];
  return rest > 0 ? index2letter(rest) + letter : letter;
};

export type SpreadSheetWorkSheetViewProps = {
  workSheet: GoogleSpreadsheetWorksheet;
  selectedSheet: number;
};
const typeName = "Exhibition";
const classIRI = sladb.Exhibition.value;
const mappingsAvailable = Object.keys(spreadSheetMappings)
export const GoogleSpeadSheetWorkSheetView: FC<
  SpreadSheetWorkSheetViewProps
> = ({ workSheet, selectedSheet }) => {
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

  const [rawMappedData, setRawMappedData] = useState<any[]>([]);
  const locale = useRouter().locale ?? "de";
  const [selectedMapping, setSelectedMapping] = useState<string>(mappingsAvailable[0]);
  const spreadSheetMapping = useMemo(() => {
    let final: {raw?: DeclarativeMatchBasedFlatMappings , mapping: DeclarativeFlatMappings} = {
      mapping: []
    }
    try {
      const cSpreashsheetMapping =spreadSheetMappings[selectedMapping]
      final = columnDesc.length <= 0 || !cSpreashsheetMapping  ? final : {raw: cSpreashsheetMapping.raw, mapping: cSpreashsheetMapping.fieldMapping(columnDesc)}
    } catch (e) {
      console.error("failed to apply declarative mapping to column description", e)
    }
    return final
  }, [columnDesc, selectedMapping])

  useEffect(() => {
    setReducedColumns(columns.slice(0, maxColumns));
  }, [columns, maxColumns, setReducedColumns]);
  useEffect(() => {
    (async () => {
      try {
        await workSheet.loadCells();
      } catch (e) {
        console.error("failed to load cells", e);
        setLoaded(false);
        return;
      }
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
        const sheetTitle = workSheet.title;
        console.log({sheetTitle})
        if(mappingsAvailable.includes(sheetTitle)) {
          setSelectedMapping(sheetTitle)
        }
      } catch (e) {
        console.log(e);
      }
      setLoaded(true);
    })();
  }, [workSheet, setLoaded, setColumnDesc, setSelectedMapping]);

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
  const handleMapAndImport = useCallback(async () => {
    const rows = [...Array(pagination.pageSize)].map((_, index) => index + 2);
    setRawMappedData([]);
    for (const row of rows) {
      const targetData = {
        "@id": `${slent().value}${uuidv4()}`,
        "@type": classIRI,
      };
      let mappedData: any;
      try {
        mappedData = await mapByConfigFlat(
          (col: number | string) => {
            const cell = workSheet.getCell(row, col as number);
            return cell.value as string;
          },
          targetData,
          spreadSheetMapping.mapping,
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
    setRawMappedData,
    locale,
    spreadSheetMapping,
    columnDesc,
    saveMutation,
    writeToSpreadSheet,
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
        spreadSheetMapping.mapping,
        makeDefaultMappingStrategyContext(
          crudOptions?.selectFetch,
          declarativeMappings,
        ),
      );
      console.log({
        mappedData
      })
      allMappedData.push(mappedData);
    }
    setRawMappedData(allMappedData);
  }, [
    workSheet,
    crudOptions,
    pagination.pageSize,
    setRawMappedData,
    spreadSheetMapping,
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
          <FormControl>
            <Select
              label={'Select Mapping'}
              value={selectedMapping}
              onChange={(e) => setSelectedMapping(e.target.value)}
            >
              {mappingsAvailable.map((mapping) => {
                return <MenuItem key={mapping} value={mapping}>{mapping}</MenuItem>
              })}
            </Select>
          </FormControl>
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
                disableLoad={true}
              />
            );
          })}
        </List>
        {!showTable && (
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {columnDesc.map(({ index, value, letter }) => {
              return (
                <ColumnChip
                  key={index}
                  value={value}
                  columnIndex={index}
                  columnLetter={letter}
                  columnDesc={columnDesc}
                  label={filterUndefOrNull([letter, value]).join(":")}
                  spreadSheetMapping={spreadSheetMapping.mapping}
                  rawMapping={spreadSheetMapping.raw}
                  workSheet={workSheet}
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
