import { useCallback, useEffect, useState } from "react";

export type CellTypeLike = {
  value: string | number | boolean | null | any;
};

export type WorkSheet<CellType extends CellTypeLike> = {
  title: string;
  sheetId: number;
  index: number;
  rowCount: number;
  columnCount: number;
  getCell: (rowIndex: number, columnIndex: number) => CellType | null;
};

export type CachedWorkSheet<CellType extends CellTypeLike> =
  WorkSheet<CellType> & {
    loaded: boolean;
    preloadCells: (
      startRowIndex?: number,
      endRowIndex?: number,
      startColumnIndex?: number,
      endColumnIndex?: number,
    ) => Promise<void>;
  };

export type LoadableWorkSheet<CellType extends CellTypeLike> =
  WorkSheet<CellType> & {
    loadCells: (options: {
      startRowIndex: number;
      endRowIndex: number;
      startColumnIndex: number;
      endColumnIndex: number;
    }) => Promise<any>;
  };

export type UseCachedWorkSheetOptions<
  CellType extends CellTypeLike,
  RemoteWorkSheet = WorkSheet<CellType>,
> = {
  workSheet: RemoteWorkSheet;
  staleTime?: number;
  autoCache?: boolean;
};
export const useCashedWorkSheet = <
  CellType extends CellTypeLike,
  RemoteWorksheet extends LoadableWorkSheet<CellType>,
>({
  workSheet,
  staleTime = 1000 * 60 * 5,
  autoCache,
}: UseCachedWorkSheetOptions<
  CellType,
  RemoteWorksheet
>): CachedWorkSheet<CellType> => {
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
