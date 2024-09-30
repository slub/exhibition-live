import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAdbContext,
  useCRUDWithQueryClient,
  useExtendedSchema,
  useGlobalCRUDOptions,
  useModifiedRouter,
} from "@slub/edb-state-hooks";
import {
  CellTypeLike,
  LoadableWorkSheet,
  useCashedWorkSheet,
} from "./useCachedWorkSheet";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { OwnColumnDesc } from "./types";
import {
  DeclarativeFlatMappings,
  DeclarativeMatchBasedFlatMappings,
  mapByConfigFlat,
} from "@slub/edb-data-mapping";
import { spreadSheetMappings } from "../config/spreadSheetMappings";
import { MappedItem } from "./MappedItem";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import { ColumnChip } from "./ColumnChip";
import { filterUndefOrNull, index2letter } from "@slub/edb-core-utils";
import { makeDefaultMappingStrategyContext } from "@slub/edb-ui-utils";

export type SpreadSheetWorkSheetViewProps<
  CellType extends CellTypeLike,
  RemoteWorksheet extends LoadableWorkSheet<CellType>,
> = {
  workSheet: RemoteWorksheet;
  mappingId: string;
};
export const SpreadSheetWorkSheetView = <
  CellType extends CellTypeLike,
  RemoteWorksheet extends LoadableWorkSheet<CellType>,
>({
  workSheet: workSheetOriginal,
  mappingId,
}: SpreadSheetWorkSheetViewProps<CellType, RemoteWorksheet>) => {
  const {
    queryBuildOptions: { prefixes, primaryFields },
    typeNameToTypeIRI,
    typeIRIToTypeName,
    createEntityIRI,
    jsonLDConfig: { defaultPrefix },
    normDataMapping,
  } = useAdbContext();
  const workSheet = useCashedWorkSheet<CellType, RemoteWorksheet>({
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
  const selectedMapping = useMemo(
    () => spreadSheetMappings[mappingId],
    [mappingId],
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
      const cSpreadSheetMapping = selectedMapping;
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
      //first get the header cells to get the column names
      const headerCells = [...Array(workSheet.columnCount)].map((_, index) => {
        return workSheet.getCell(0, index);
      });
      const columnDesc_ = headerCells.map((googleSpreadSheetCell, index) => ({
        index,
        value: googleSpreadSheetCell?.value || null,
        letter: index2letter(index),
      }));
      setColumnDesc(columnDesc_);
      const cols = headerCells.map((cell, index) => {
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
    setLoaded(true);
  }, [
    workSheet,
    crudOptions,
    spreadSheetMapping.mapping,
    setLoaded,
    setColumnDesc,
  ]);

  useEffect(() => {
    if (!loaded) return;
    calculateMapping();
  }, [loaded]);

  useEffect(() => {
    if (spreadSheetMapping.mapping.length <= 0) return;
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
          <>
            <MappedItem
              index={rowIndex}
              workSheet={workSheet}
              spreadSheetMapping={spreadSheetMapping.mapping}
              path={pathSegments.join("/")}
              crudOptions={crudOptions}
              key={pathSegments.join("/")}
            />
          </>
        );
      },
    };
    // @ts-ignore
    setColumns((prev) => [mappedCol, ...prev.filter((col) => col.id !== "-1")]);
  }, [workSheet, crudOptions, spreadSheetMapping.mapping, setColumns]);

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
      (_, index) => index + pagination.pageIndex * pagination.pageSize + 1,
    );
    console.log({ rows });

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
            createEntityIRI,
            typeIRIToTypeName,
            primaryFields,
            normDataMapping,
          ),
        );
      } catch (e) {
        console.warn("failed to map row", row, e);
      }
      console.log({ mappedData });

      if (mappedData) {
        const success = await saveMutation.mutateAsync(mappedData);
        if (success) {
          console.log("success", success);
          setRawMappedData((prev) => [...prev, mappedData]);
          /*if (writeToSpreadSheet) {
            const idCellColumnIndex = columnDesc.findIndex(
              ({value}) => value === "exhibition-live IRI",
            );
            const directLinkCellColumnIndex = columnDesc.findIndex(
              ({value}) => value === "exhibition-live direct link",
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
          }*/
        } else {
          console.error("failed");
          /*if (writeToSpreadSheet) {
            const idCellColumnIndex = columnDesc.findIndex(
              ({value}) => value === "exhibition-live IRI",
            );
            const idCell = workSheet.getCell(row, idCellColumnIndex);
            idCell.value = "failed";
            idCell.save();
          }*/
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
    typeIRIToTypeName,
    primaryFields,
    normDataMapping,
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
              createEntityIRI,
              typeNameToTypeIRI,
              primaryFields,
              normDataMapping,
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
    primaryFields,
    normDataMapping,
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
