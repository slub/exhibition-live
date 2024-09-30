import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  useAdbContext,
  useDataStore,
  useGlobalCRUDOptions,
  useModifiedRouter,
  useMutation,
  useQuery,
  useQueryClient,
  useSettings,
} from "@slub/edb-state-hooks";
import {
  Backdrop,
  Box,
  CircularProgress,
  IconButton,
  ListItemIcon,
  MenuItem,
  Skeleton,
} from "@mui/material";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_Row,
  MRT_RowSelectionState,
  MRT_SortingState,
  MRT_TableInstance,
  MRT_Virtualizer,
  MRT_VisibilityState,
  useMaterialReactTable,
} from "material-react-table";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import { MRT_Localization_DE } from "material-react-table/locales/de";

import { JSONSchema7 } from "json-schema";
import {
  Delete,
  DeleteForever,
  Edit,
  FileDownload,
  NoteAdd,
  OpenInNew,
} from "@mui/icons-material";
import NiceModal from "@ebay/nice-modal-react";
import { useSnackbar } from "notistack";
import Button from "@mui/material/Button";
import { ConfigOptions, download, generateCsv, mkConfig } from "export-to-csv";
import { useTranslation } from "next-i18next";
import { moveToTrash } from "@slub/sparql-schema";
import { computeColumns } from "./listHelper";
import { encodeIRI, filterUndefOrNull } from "@slub/edb-ui-utils";
import { bringDefinitionToTop } from "@slub/json-schema-utils";
import { GenericModal } from "@slub/edb-basic-components";
import { ExportMenuButton } from "./ExportMenuButton";
import { TableConfigRegistry } from "./types";
import { typeIRItoTypeName } from "adb-next/components/config";

export type SemanticTableProps = {
  typeName: string;
  csvOptions?: ConfigOptions;
  tableConfigRegistry?: TableConfigRegistry;
};

const defaultCsvOptions: ConfigOptions = {
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
};

export const SemanticTable = ({
  typeName,
  csvOptions,
  tableConfigRegistry: tableConfig,
}: SemanticTableProps) => {
  const {
    queryBuildOptions,
    jsonLDConfig: { defaultPrefix },
    typeNameToTypeIRI,
    createEntityIRI,
    schema,
    components: { EntityDetailModal },
  } = useAdbContext();

  const csvConfig = useMemo(
    () => mkConfig(csvOptions || defaultCsvOptions),
    [csvOptions],
  );

  const typeIRI = useMemo(() => {
    return typeNameToTypeIRI(typeName);
  }, [typeName, typeNameToTypeIRI]);

  const { t } = useTranslation();
  const { t: t2 } = useTranslation("table");

  const loadedSchema = useMemo(
    () => bringDefinitionToTop(schema as JSONSchema7, typeName),
    [typeName],
  );

  const { activeEndpoint } = useSettings();

  const [sorting, setSorting] = useState<MRT_SortingState>([
    { id: "IRI", desc: false },
  ]);

  const handleColumnOrderChange = useCallback(
    (s: MRT_SortingState) => {
      setSorting(s);
    },
    [setSorting],
  );

  const { crudOptions } = useGlobalCRUDOptions();
  const { dataStore, ready } = useDataStore({
    schema,
    crudOptionsPartial: crudOptions,
    typeNameToTypeIRI,
    queryBuildOptions,
  });

  const { data: resultListData, isLoading } = useQuery(
    ["allEntries", typeIRI, sorting],
    () => {
      const typeName = typeIRItoTypeName(typeIRI);
      return dataStore.findDocumentsAsFlatResultSet(
        typeName,
        {
          sorting,
        },
        4000,
      );
    },
    { enabled: ready },
  );

  const resultList = useMemo(
    () => resultListData?.results?.bindings ?? [],
    [resultListData],
  );
  const headerVars = useMemo(
    () => resultListData?.head?.vars,
    [resultListData],
  );

  const conf = useMemo(
    () => tableConfig?.[typeName] || tableConfig?.default,
    [typeName],
  );

  const displayColumns = useMemo<MRT_ColumnDef<any>[]>(() => {
    const cols = computeColumns(
      loadedSchema,
      typeName,
      t2,
      conf?.matcher,
      [],
      queryBuildOptions.primaryFields,
    );
    return cols;
  }, [
    loadedSchema,
    typeName,
    t2,
    conf?.matcher,
    queryBuildOptions.primaryFields,
  ]);

  const columnOrder = useMemo(
    () => ["mrt-row-select", ...displayColumns.map((col) => col.id)],
    [displayColumns],
  );

  const router = useModifiedRouter();
  const locale = (router.query.locale || "en") as string;
  const localization = useMemo(
    () => (locale === "de" ? MRT_Localization_DE : MRT_Localization_EN),
    [locale],
  );
  const editEntry = useCallback(
    (id: string) => {
      router.push(`/create/${typeName}?encID=${encodeIRI(id)}`);
    },
    [router, typeName],
  );
  const showEntry = useCallback(
    (id: string) => {
      NiceModal.show(EntityDetailModal, {
        typeIRI: typeIRI,
        entityIRI: id,
        disableInlineEditing: true,
      });
    },
    [typeIRI, EntityDetailModal],
  );
  const queryClient = useQueryClient();
  const { mutateAsync: moveToTrashAsync, isLoading: aboutToMoveToTrash } =
    useMutation(
      ["moveToTrash", (id: string | string[]) => id],
      async (id: string | string[]) => {
        if (!id || !crudOptions.updateFetch)
          throw new Error("entityIRI or updateFetch is not defined");
        return moveToTrash(id, typeIRI, loadedSchema, crudOptions.updateFetch, {
          defaultPrefix,
          queryBuildOptions,
        });
      },
      {
        onSuccess: async () => {
          console.log("invalidateQueries");
          queryClient.invalidateQueries(["list"]);
          queryClient.invalidateQueries(
            filterUndefOrNull(["allEntries", typeIRI || undefined]),
          );
        },
      },
    );
  const { mutateAsync: removeEntity, isLoading: aboutToRemove } = useMutation(
    ["remove", (id: string) => id],
    async (id: string) => {
      if (!id || !dataStore.removeDocument)
        throw new Error("entityIRI or removeDocument is not defined");
      return dataStore.removeDocument(typeName, id);
    },
    {
      onSuccess: async () => {
        console.log("invalidateQueries");
        queryClient.invalidateQueries(["list"]);
        queryClient.invalidateQueries(
          filterUndefOrNull(["allEntries", typeIRI || undefined]),
        );
      },
    },
  );
  const { enqueueSnackbar } = useSnackbar();
  const handleRemove = useCallback(
    async (id: string) => {
      NiceModal.show(GenericModal, {
        type: "delete",
      }).then(async () => {
        enqueueSnackbar(t("about to remove"), { variant: "info" });
        await removeEntity(id);
        enqueueSnackbar(t("removed"), { variant: "success" });
      });
    },
    [removeEntity, enqueueSnackbar, t],
  );
  const handleMoveToTrash = useCallback(
    async (id: string) => {
      NiceModal.show(GenericModal, {
        type: "moveToTrash",
      }).then(async () => {
        enqueueSnackbar("About to move to trash", { variant: "info" });
        await moveToTrashAsync(id);
        enqueueSnackbar("Moved to trash", { variant: "success" });
        return;
      });
    },
    [moveToTrashAsync, enqueueSnackbar],
  );

  const tableContainerRef = useRef<HTMLDivElement>(null); //we can get access to the underlying TableContainer element and react to its scroll events
  const rowVirtualizerInstanceRef =
    useRef<MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null); //we can get access to the underlying Virtualizer instance and call its scrollToIndex method
  const handleExportRows = (rows: MRT_Row<any>[]) => {
    const rowData = rows.map((row) =>
      Object.fromEntries(
        row.getAllCells().map((cell) => [cell.column.id, cell.getValue()]),
      ),
    );
    const csv = generateCsv(csvConfig)(rowData as any);
    download(csvConfig)(csv);
  };

  const handleExportData = useCallback(() => {
    //const rowData = table.getState().all  .map((row) => Object.fromEntries( row.getAllCells().map(cell => [cell.column.id, cell.getValue()])));
    const csv = generateCsv(csvConfig)(
      resultList.map((entity) =>
        Object.fromEntries(
          Object.entries(entity).map(([k, v]) => [
            k,
            String((v as any)?.value || ""),
          ]),
        ),
      ),
    );
    download(csvConfig)(csv);
  }, [resultList, csvConfig]);

  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const handleRowSelectionChange = useCallback(
    (s: MRT_RowSelectionState) => {
      setRowSelection(s);
    },
    [setRowSelection],
  );

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    [],
  );
  const handleColumnFilterChange = useCallback(
    (s) => {
      setColumnFilters((old) => {
        return s(old);
      });
    },
    [setColumnFilters],
  );

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    conf?.columnVisibility || tableConfig?.default?.columnVisibility,
  );

  const handleChangeColumnVisibility = useCallback(
    (s: any) => {
      setColumnVisibility(s);
    },
    [setColumnVisibility],
  );
  const handleRemoveSelected = useCallback(
    (table_: MRT_TableInstance<any>) => {
      const selectedRows = table_.getSelectedRowModel().rows;
      const c = selectedRows.length;

      NiceModal.show(GenericModal, {
        type: "delete",
        extraMessage: t("delete selected entries", { count: c }),
      })
        .then(() => {
          enqueueSnackbar(t("will remove entries", { count: c }), {
            variant: "info",
          });
          return Promise.all(
            selectedRows.map(async (row) => {
              const id = (row.original.entity as any)?.value;
              if (id) {
                return await removeEntity(id);
              }
            }),
          );
        })
        .then(() => {
          enqueueSnackbar(t("successfully removed entries", { count: c }), {
            variant: "success",
          });
        });
    },
    [removeEntity, enqueueSnackbar, t],
  );
  const handleMoveToTrashSelected = useCallback(
    (table_: MRT_TableInstance<any>) => {
      const selectedRows = table_.getSelectedRowModel().rows;
      const c = selectedRows.length;

      NiceModal.show(GenericModal, {
        type: "moveToTrash",
        extraMessage: t("move selected entries to trash", { count: c }),
      })
        .then(async () => {
          enqueueSnackbar(t("will move entries to trash", { count: c }), {
            variant: "info",
          });
          return await moveToTrashAsync(
            filterUndefOrNull(
              selectedRows.map((row) => {
                return (row.original.entity as any)?.value;
              }),
            ),
          );
        })
        .then(() => {
          enqueueSnackbar(
            t("successfully moved entries to trash", { count: c }),
            {
              variant: "success",
            },
          );
        });
    },
    [moveToTrashAsync, enqueueSnackbar, t],
  );

  const table = useMaterialReactTable({
    columns: displayColumns,
    data: resultList,
    enableStickyHeader: true,
    rowVirtualizerInstanceRef: rowVirtualizerInstanceRef,
    muiTableContainerProps: {
      ref: tableContainerRef, //get access to the table container element
      sx: {
        maxHeight: `calc(100vh - 180px)`,
        "&::-webkit-scrollbar": {
          height: 8,
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "#F8F8F8",
          borderRadius: 4,
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#B6BCC3",
          borderRadius: 4,
        },
      },
    },
    rowVirtualizerOptions: { overscan: 4 },
    enableColumnVirtualization: false,
    enableColumnOrdering: true,
    enableRowSelection: true,
    enableFacetedValues: true,
    onRowSelectionChange: handleRowSelectionChange,
    manualPagination: false,
    manualSorting: true,
    onSortingChange: handleColumnOrderChange,
    onColumnVisibilityChange: handleChangeColumnVisibility,
    columnFilterDisplayMode: "popover",
    initialState: {
      columnVisibility: conf.columnVisibility,
      pagination: { pageIndex: 0, pageSize: 25 },
    },
    localization,
    rowCount: resultList.length,
    enableRowActions: true,
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Button
          variant="contained"
          color={"primary"}
          startIcon={<NoteAdd />}
          onClick={() => {
            editEntry(createEntityIRI(typeName));
          }}
        >
          {t("create new", { item: t(typeName) })}
        </Button>
        <ExportMenuButton>
          <MenuItem onClick={handleExportData}>
            <ListItemIcon>
              <FileDownload />
            </ListItemIcon>
            {t("export all data")}
          </MenuItem>
          <MenuItem
            disabled={table.getRowModel().rows.length === 0}
            onClick={() => handleExportRows(table.getRowModel().rows)}
          >
            <ListItemIcon>
              <FileDownload />
            </ListItemIcon>
            {t("export page only")}
          </MenuItem>
          <MenuItem
            disabled={
              !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
            }
            onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          >
            <ListItemIcon>
              <FileDownload />
            </ListItemIcon>
            {t("export selected rows only")}
          </MenuItem>
        </ExportMenuButton>
        {
          <>
            <IconButton
              onClick={() => handleMoveToTrashSelected(table)}
              disabled={
                !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
              }
              color="error"
              aria-label={t("move to trash")}
            >
              <Delete />
            </IconButton>
            <IconButton
              onClick={() => handleRemoveSelected(table)}
              disabled={
                !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
              }
              color="error"
              aria-label={t("delete permanently")}
            >
              <DeleteForever />
            </IconButton>
          </>
        }
      </Box>
    ),
    getRowId: (row) =>
      (row as any)?.entity?.value ||
      (row as any)?.originalValue?.entity?.value ||
      `urn:${uuidv4()}`,
    displayColumnDefOptions: {
      "mrt-row-actions": {
        header: "",
      },
    },
    renderRowActionMenuItems: ({ row }) => {
      return [
        <MenuItem
          key="show"
          onClick={() => showEntry(row.id)}
          sx={{ minWidth: 200 }}
        >
          <ListItemIcon>
            <OpenInNew />
          </ListItemIcon>
          {t("show")}
        </MenuItem>,
        <MenuItem
          key="edit"
          onClick={() => editEntry(row.id)}
          sx={{ minWidth: 200 }}
        >
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          {t("edit")}
        </MenuItem>,
        <MenuItem
          key="moveToTrash"
          onClick={() => handleMoveToTrash(row.id)}
          sx={{ minWidth: 200 }}
        >
          <ListItemIcon>
            <Delete />
          </ListItemIcon>
          {t("move to trash")}
        </MenuItem>,
        <MenuItem
          key="deleteForever"
          onClick={() => handleRemove(row.id)}
          sx={{ minWidth: 200 }}
        >
          <ListItemIcon>
            <DeleteForever />
          </ListItemIcon>
          {t("delete permanently")}
        </MenuItem>,
      ];
    },
    enableColumnResizing: true,
    enableColumnDragging: false,
    onColumnFiltersChange: handleColumnFilterChange,
    state: {
      columnOrder,
      sorting,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
  });

  const [typeLoaded, setTypeLoaded] = useState(null);

  useEffect(() => {
    if (typeName && typeLoaded !== typeName) {
      setTypeLoaded(typeName);
      enqueueSnackbar(t("loading typename", { typeName: t(typeName) }), {
        variant: "info",
      });
      table.reset();
    }
  }, [typeName, typeLoaded, enqueueSnackbar, t, table]);

  return (
    <Box sx={{ width: "100%" }}>
      {isLoading && displayColumns.length <= 0 ? (
        <Skeleton variant="rectangular" height={"50%"} />
      ) : (
        <>
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={isLoading || aboutToRemove}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
          <MaterialReactTable table={table} />
        </>
      )}
    </Box>
  );
};
