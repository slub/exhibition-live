import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetCell,
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
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  Grid,
  IconButton,
  List,
  Menu,
  MenuItem,
  Select,
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
import { mapByConfigFlat } from "@slub/edb-ui-utils";
import { spreadSheetMappings } from "../config/spreadSheetMappings";
import { declarativeMappings } from "../config";
import { makeDefaultMappingStrategyContext } from "../form/SimilarityFinder";
import {
  useAdbContext,
  useGlobalCRUDOptions,
  useModifiedRouter,
} from "@slub/edb-state-hooks";
import { encodeIRI, filterUndefOrNull } from "@slub/edb-ui-utils";
import { useQuery } from "@tanstack/react-query";
import { OwnColumnDesc } from "./types";
import TypedListItem from "../content/list/TypedListItem";
import HorizontalNonLinearStepper from "../form/wizard/HorizontalNonLinearStepper";
import {
  useCRUDWithQueryClient,
  useExtendedSchema,
} from "@slub/edb-state-hooks";
import FormControlLabel from "@mui/material/FormControlLabel";
import {
  DeclarativeFlatMapping,
  DeclarativeFlatMappings,
} from "@slub/edb-ui-utils";
import { useTranslation } from "next-i18next";
import { NiceMappingConfigurationDialog } from "../mapping/NiceMappingConfigurationDialog";
import {
  DeclarativeMatchBasedFlatMapping,
  DeclarativeMatchBasedFlatMappings,
} from "@slub/edb-ui-utils";
import { CRUDFunctions } from "@slub/edb-core-types";

//we will create a cashed worksheet, were selectively rows are preloaded and once loaded use for a certain stale time
type CachedWorkSheet = {
  loaded: boolean;
  title: string;
  sheetId: number;
  index: number;
  rowCount: number;
  columnCount: number;
  preloadCells: (
    startRowIndex?: number,
    endRowIndex?: number,
    startColumnIndex?: number,
    endColumnIndex?: number,
  ) => Promise<void>;
  getCell: (rowIndex: number, columnIndex: number) => GoogleSpreadsheetCell;
};

type UseCachedWorkSheetOptions = {
  workSheet: GoogleSpreadsheetWorksheet;
  staleTime?: number;
  autoCache?: boolean;
};

const useCashedWorkSheet = ({
  workSheet,
  staleTime = 1000 * 60 * 5,
  autoCache,
}: UseCachedWorkSheetOptions): CachedWorkSheet => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [rowCount, setRowCount] = useState<number>(0);
  const [columnCount, setColumnCount] = useState<number>(0);
  const [title, setTitle] = useState<string>("");

  const getCell = useCallback(
    (rowIndex: number, columnIndex: number) => {
      try {
        return workSheet.getCell(rowIndex, columnIndex);
      } catch (e) {
        console.error("failed to load cell", e);
        return null;
      }
    },
    [workSheet],
  );

  const preloadCells = useCallback(
    async (
      startRowIndex = 0,
      endRowIndex = 10,
      startColumnIndex = 0,
      endColumnIndex = 10,
    ) => {
      console.log("will load cells", {
        startRowIndex,
        endRowIndex,
        startColumnIndex,
        endColumnIndex,
      });
      try {
        await workSheet.loadCells({
          startRowIndex,
          endRowIndex,
          startColumnIndex,
          endColumnIndex,
        });
      } catch (e) {
        console.error("failed to load cells", e);
        setTimeout(() => {
          console.log("retrying to load cells");
          setLoaded(true);
        }, 1);
        return;
      }
      setLoaded(true);
    },
    [workSheet, setLoaded],
  );

  useEffect(() => {
    (async () => {
      setRowCount(workSheet.rowCount);
      setColumnCount(workSheet.columnCount);
      setTitle(workSheet.title);
    })();
  }, [workSheet, setLoaded, setRowCount, setColumnCount, setTitle]);

  useEffect(() => {
    if (autoCache && !loaded) {
      preloadCells(0, workSheet.rowCount, 0, workSheet.columnCount);
    }
  }, [
    workSheet.rowCount,
    workSheet.columnCount,
    autoCache,
    loaded,
    preloadCells,
  ]);

  return {
    loaded,
    title,
    sheetId: workSheet.sheetId,
    index: workSheet.index,
    rowCount,
    columnCount,
    preloadCells,
    getCell,
  };
};

type GoogleSpreadSheetTableProps = {
  workSheet: CachedWorkSheet;
  columnIndicies: number[];
};

export const GoogleSpreadSheetTable: FC<GoogleSpreadSheetTableProps> = ({
  workSheet,
  columnIndicies,
}) => {
  const loaded = workSheet.loaded;
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [columns, setColumns] = useState<MRT_ColumnDef<any>[]>([]);
  const [columnDesc, setColumnDesc] = useState<OwnColumnDesc[]>([]);
  const reducedColumns = useMemo(() => {
    return columns.filter((column, index) => columnIndicies.includes(index));
  }, [columns, columnIndicies]);

  useEffect(() => {
    (async () => {
      if (!loaded) return;
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
              try {
                const dataCell = workSheet.getCell(originalRow + 1, index);
                return dataCell?.value ?? null;
              } catch (e) {
                return null;
              }
            },
          };
        });
        setColumns(cols as MRT_ColumnDef<any>[]);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [workSheet, loaded, setColumnDesc]);

  const rowCount = useMemo(
    () => Math.ceil(workSheet.rowCount - 2),
    [workSheet],
  );
  // needs to be just the right amount of rows: so full pageSize  but a the end the Rest of the rowCount divided by pageSize
  const isLastRow = rowCount - 2 <= pagination.pageSize * pagination.pageIndex;
  const amountOfFakeRows =
    rowCount <= 0
      ? 0
      : isLastRow
        ? rowCount % pagination.pageSize
        : pagination.pageSize;
  const fakeData = [...Array(amountOfFakeRows)].map(
    (_, index) => index + pagination.pageIndex * pagination.pageSize,
  );

  const materialTable = useMaterialReactTable({
    // @ts-ignore
    columns: reducedColumns,
    data: fakeData,
    rowCount,
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
};

type ColumnChipProps = {
  columnIndex: number;
  columnLetter: string;
  columnDesc: OwnColumnDesc[];
  value: any;
  label: string;
  spreadSheetMapping?: DeclarativeFlatMappings;
  rawMapping?: DeclarativeMatchBasedFlatMappings;
  workSheet: CachedWorkSheet;
};
const ColumnChip = ({
  label,
  columnIndex,
  columnLetter,
  columnDesc,
  spreadSheetMapping,
  rawMapping,
  workSheet,
}: ColumnChipProps) => {
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const columnMapping = useMemo(
    () =>
      spreadSheetMapping?.filter((mapping) =>
        Boolean(
          (mapping.source.columns as any)?.find((col) =>
            typeof col === "string"
              ? col === columnLetter
              : col === columnIndex,
          ),
        ),
      ) || [],
    [spreadSheetMapping, columnIndex, columnLetter],
  );
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAssignMapping = useCallback(() => {}, []);
  const handleOpenMapping = useCallback(
    (
      mappingDecl: DeclarativeFlatMapping,
      rawMapping?: DeclarativeMatchBasedFlatMapping,
    ) => {
      NiceModal.show(NiceMappingConfigurationDialog, {
        mapping: mappingDecl,
        rawMapping,
        sourcePath: columnIndex,
        fields: columnDesc,
        tablePreview: (mapping: DeclarativeFlatMapping) => {
          return (
            <GoogleSpreadSheetTable
              workSheet={workSheet}
              columnIndicies={mapping.source.columns as number[]}
            />
          );
        },
      });
    },
    [columnIndex, workSheet, columnDesc],
  );

  return (
    <>
      <Chip
        label={label}
        color={columnMapping.length > 0 ? "primary" : undefined}
        sx={{ margin: "0.2rem" }}
        onClick={handleClick}
      />
      <Menu
        id="lock-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "lock-button",
          role: "listbox",
        }}
      >
        <MenuItem key={"option1"} onClick={handleAssignMapping}>
          {t("assign mapping")}
        </MenuItem>
        <Divider />
        {columnMapping.map((mapping, index) => {
          const raw = rawMapping?.find(
            (rawMappingDecl) => rawMappingDecl.id === mapping.id,
          );
          return (
            <MenuItem
              key={index}
              onClick={() => handleOpenMapping(mapping, raw)}
            >
              {t("open Mapping", { index: index + 1 })}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

type MappedItemProps = {
  path: string;
  index: number;
  spreadSheetMapping: DeclarativeFlatMappings;
  workSheet: CachedWorkSheet;
  crudOptions?: CRUDFunctions;
};

const MappedItem = ({
  path,
  index,
  spreadSheetMapping,
  workSheet,
  crudOptions,
}: MappedItemProps) => {
  const {
    queryBuildOptions: { prefixes, primaryFields },
    createEntityIRI,
    typeNameToTypeIRI,
    jsonLDConfig: { defaultPrefix },
  } = useAdbContext();
  const mapData = useCallback(async () => {
    try {
      const targetData = {
        __index: index,
        "@id": createEntityIRI("Exhibition"),
        "@type": typeNameToTypeIRI("Exhibition"),
      };
      console.log("will map by config");
      const mappedData = await mapByConfigFlat(
        (col: number | string) => {
          const cell = workSheet.getCell(index, col as number);
          return cell.value as string;
        },
        targetData,
        spreadSheetMapping,
        makeDefaultMappingStrategyContext(
          crudOptions?.selectFetch,
          {
            defaultPrefix,
            prefixes,
          },
          defaultPrefix,
          createEntityIRI,
          primaryFields,
          declarativeMappings,
        ),
      );
      return mappedData;
    } catch (e) {
      console.warn("failed to map row", index, e);
    }
    return null;
  }, [
    workSheet,
    crudOptions,
    spreadSheetMapping,
    primaryFields,
    index,
    createEntityIRI,
    defaultPrefix,
    prefixes,
    typeNameToTypeIRI,
  ]);

  const { data, isLoading } = useQuery(["mappedData", path], mapData, {
    enabled: workSheet.loaded && spreadSheetMapping.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes,
  });
  const { t } = useTranslation();

  return isLoading ? (
    <CircularProgress title={t("calculate mapped data")} />
  ) : (
    <List>
      {data?.["@type"] && (
        <TypedListItem index={index} data={data} disableLoad={true} />
      )}
    </List>
  );
};

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
const mappingsAvailable = Object.keys(spreadSheetMappings);
export const GoogleSpeadSheetWorkSheetView: FC<
  SpreadSheetWorkSheetViewProps
> = ({ workSheet: workSheetOriginal, selectedSheet }) => {
  const {
    queryBuildOptions: { prefixes },
    createEntityIRI,
    typeNameToTypeIRI,
    jsonLDConfig: { defaultPrefix },
  } = useAdbContext();
  const workSheet = useCashedWorkSheet({
    workSheet: workSheetOriginal,
    autoCache: true,
  });
  const loaded = workSheet.loaded;
  const [_loaded, setLoaded] = useState<boolean>(false);
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
  const {
    query: { locale = "de" },
  } = useModifiedRouter();
  const [selectedMapping, setSelectedMapping] = useState<string>(
    mappingsAvailable[0],
  );
  const { crudOptions } = useGlobalCRUDOptions();
  const spreadSheetMapping = useMemo(() => {
    let final: {
      raw?: DeclarativeMatchBasedFlatMappings;
      mapping: DeclarativeFlatMappings;
    } = {
      mapping: [],
    };
    try {
      const cSpreadSheetMapping = spreadSheetMappings[selectedMapping];
      final =
        columnDesc.length <= 0 || !cSpreadSheetMapping
          ? final
          : {
              raw: cSpreadSheetMapping.raw,
              mapping: cSpreadSheetMapping.fieldMapping(columnDesc),
            };
    } catch (e) {
      console.error(
        "failed to apply declarative mapping to column description",
        e,
      );
    }
    return final;
  }, [columnDesc, selectedMapping]);

  useEffect(() => {
    setReducedColumns(columns?.slice(0, maxColumns) || []);
  }, [columns, maxColumns, setReducedColumns]);

  const calculateMapping = useCallback(async () => {
    if (!workSheet.loaded) return;
    try {
      const cells = [...Array(workSheet.columnCount)].map((_, index) => {
        return workSheet.getCell(0, index);
      });
      const columnDesc_ = cells.map((googleSpreadSheetCell, index) => ({
        index,
        value: googleSpreadSheetCell?.value || null,
        letter: index2letter(index),
      }));
      setColumnDesc(columnDesc_);
      const mappedCol = {
        id: "-1",
        header: "mapped Data",
        accessorFn: (originalRow, rowIndex) => {
          return originalRow + 1;
        },
        Cell: ({ cell }) => {
          const rowIndex = cell.getValue();
          const pathSegments = [
            workSheet.sheetId,
            String(workSheet.index),
            String(rowIndex),
          ];

          return (
            <MappedItem
              index={rowIndex}
              workSheet={workSheet}
              spreadSheetMapping={spreadSheetMapping.mapping}
              path={pathSegments.join("/")}
              crudOptions={crudOptions}
              key={pathSegments.join("/")}
            />
          );
        },
      };
      const cols = cells.map((cell, index) => {
        return {
          id: (cell.value ?? "").toString() + index,
          header: (cell.value ?? "").toString(),
          accessorFn: (originalRow, rowIndex) => {
            try {
              const dataCell = workSheet.getCell(originalRow + 1, index);
              return dataCell?.value ?? null;
            } catch (e) {
              return null;
            }
          },
        };
      });
      setColumns([mappedCol, ...cols] as MRT_ColumnDef<any>[]);
      const sheetTitle = workSheet.title;
      if (mappingsAvailable.includes(sheetTitle)) {
        setSelectedMapping(sheetTitle);
      }
    } catch (e) {
      console.log(e);
    }
    setLoaded(true);
  }, [
    workSheet,
    crudOptions,
    spreadSheetMapping.mapping,
    setLoaded,
    setColumnDesc,
    setSelectedMapping,
  ]);

  const rowCount = useMemo(
    () => Math.ceil(workSheet.rowCount - 2),
    [workSheet.rowCount],
  );
  // needs to be just the right amount of rows: so full pageSize  but a the end the Rest of the rowCount divided by pageSize
  const isLastRow = rowCount - 2 <= pagination.pageSize * pagination.pageIndex;
  const amountOfFakeRows =
    rowCount <= 0
      ? 0
      : isLastRow
        ? rowCount % pagination.pageSize
        : pagination.pageSize;
  const fakeData = [...Array(amountOfFakeRows)].map(
    (_, index) => index + pagination.pageIndex * pagination.pageSize,
  );

  const materialTable = useMaterialReactTable({
    // @ts-ignore
    columns: reducedColumns,
    data: fakeData,
    rowCount: rowCount,
    manualPagination: true,
    // @ts-ignore
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  const typeName = "Exhibition";
  const classIRI = useMemo(
    () => typeNameToTypeIRI(typeName),
    [typeName, typeNameToTypeIRI],
  );
  const loadedSchema = useExtendedSchema({ typeName });
  const { saveMutation } = useCRUDWithQueryClient({
    schema: loadedSchema,
    queryOptions: { enabled: false },
    loadQueryKey: "importsave",
    allowUnsafeSourceIRIs: true,
  });
  const handleMapAndImport = useCallback(async () => {
    const rows = [...Array(pagination.pageSize)].map(
      (_, index) => index + pagination.pageIndex + 2,
    );

    setRawMappedData([]);
    for (const row of rows) {
      const targetData = {
        "@id": createEntityIRI(typeName),
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
            {
              defaultPrefix,
              prefixes,
            },
            defaultPrefix,
            createEntityIRI,
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
    pagination.pageIndex,
    setRawMappedData,
    locale,
    spreadSheetMapping,
    columnDesc,
    saveMutation,
    writeToSpreadSheet,
    typeName,
    classIRI,
    createEntityIRI,
    defaultPrefix,
    prefixes,
  ]);

  const handleMapping = useCallback(async () => {
    const rows = [...Array(pagination.pageSize)].map(
      (_, index) => index + 1 + pagination.pageIndex * pagination.pageSize,
    );
    const allMappedData = rawMappedData.slice();
    for (const row of rows) {
      let mappedData = allMappedData.find(
        (data) => data["__index"] === row - 1,
      );
      if (!mappedData) {
        try {
          const targetData = {
            __index: row - 1,
            "@id": createEntityIRI(typeName),
            "@type": classIRI,
          };
          mappedData = await mapByConfigFlat(
            (col: number | string) => {
              const cell = workSheet.getCell(row, col as number);
              return cell.value as string;
            },
            targetData,
            spreadSheetMapping.mapping,
            makeDefaultMappingStrategyContext(
              crudOptions?.selectFetch,
              {
                defaultPrefix,
                prefixes,
              },
              defaultPrefix,
              createEntityIRI,
              declarativeMappings,
            ),
          );
          allMappedData.push(mappedData);
        } catch (e) {
          console.warn("failed to map row", row, e);
        }
      }
    }
    setRawMappedData(allMappedData);
  }, [
    workSheet,
    crudOptions,
    pagination.pageSize,
    pagination.pageIndex,
    rawMappedData,
    setRawMappedData,
    spreadSheetMapping,
    classIRI,
    createEntityIRI,
    defaultPrefix,
    prefixes,
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
              label={"Select Mapping"}
              value={selectedMapping}
              onChange={(e) => setSelectedMapping(e.target.value)}
            >
              {mappingsAvailable.map((mapping) => {
                return (
                  <MenuItem key={mapping} value={mapping}>
                    {mapping}
                  </MenuItem>
                );
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
          <Button onClick={calculateMapping}>Calculate Mapping</Button>
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
export const GoogleSpreadSheetView: FC<GoogleSpreadSheetViewProps> = ({
  sheetId,
}) => {
  const { spreadSheet, loaded } = useSpreadSheet(sheetId);
  return loaded && <SpreadSheetView spreadSheet={spreadSheet} />;
};
