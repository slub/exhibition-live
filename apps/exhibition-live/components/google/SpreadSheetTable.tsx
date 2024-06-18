import { CachedWorkSheet, CellTypeLike } from "./useCachedWorkSheet";
import React, { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { OwnColumnDesc } from "./types";
import { Box, Skeleton } from "@mui/material";
import { index2letter } from "./index2letter";

export type SpreadSheetTableProps<CellType extends CellTypeLike> = {
  workSheet: CachedWorkSheet<CellType>;
  columnIndicies: number[];
};
export const SpreadSheetTable = <CellType extends CellTypeLike>({
  workSheet,
  columnIndicies,
}: SpreadSheetTableProps<CellType>) => {
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
