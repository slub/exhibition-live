import {
  defaultPrefix,
  defaultQueryBuilderOptions,
  sladb,
  slent,
} from "../../form/formConfigs";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import schema from "../../../public/schema/Exhibition.schema.json";
import { v4 as uuidv4 } from "uuid";
import { useGlobalCRUDOptions } from "../../state/useGlobalCRUDOptions";
import {
  jsonSchema2Select,
} from "../../utils/sparql";
import {
  Backdrop,
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Link,
  ListItemIcon,
  MenuItem,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_EditActionButtons,
  MRT_Row,
  MRT_RowSelectionState,
  MRT_SortingState,
  MRT_TableInstance,
  MRT_Virtualizer,
  MRT_VisibilityState,
  useMaterialReactTable,
} from "material-react-table";
import {
  encodeIRI,
  filterUndefOrNull,
} from "../../utils/core";
import { JSONSchema7 } from "json-schema";
import {
  Add,
  Delete,
  DeleteForever,
  Details,
  Edit,
  FileDownload,
  OpenInNew,
  Visibility,
} from "@mui/icons-material";
import { primaryFields } from "../../config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SemanticFormsModal } from "../../renderer/SemanticFormsModal";
import NiceModal from "@ebay/nice-modal-react";
import GenericModal from "../../form/GenericModal";
import { useSnackbar } from "notistack";
import { remove, moveToTrash } from "../../utils/crud";
import { JsonSchema } from "@jsonforms/core";
import useExtendedSchema from "../../state/useExtendedSchema";
import Button from "@mui/material/Button";
import get from "lodash/get";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { useDrawerDimensions } from "../../state";
import { useModifiedRouter } from "../../basic";
import { OverflowContainer } from "../../lists";
import isNil from "lodash/isNil";
import { OverflowChip } from "../../lists/OverflowChip";
import { SparqlEndpoint, useSettings } from "../../state/useLocalSettings";
import { EntityDetailModal } from "../../form/show";
import { useTranslation } from "next-i18next";
import {withDefaultPrefix} from "@slub/sparql-schema";
import { SPARQLFlavour } from "@slub/edb-core-types";
import {filterForArrayProperties, filterForPrimitiveProperties, isJSONSchema} from "@slub/json-schema-utils";
import { parseMarkdownLinks } from "@slub/edb-core-utils";

type Props = {
  typeName: string;
};

const getFlavour = (endpoint?: SparqlEndpoint): SPARQLFlavour => {
  switch (endpoint?.provider) {
    case "oxigraph":
      return "oxigraph";
    case "blazegraph":
      return "blazegraph";
    case "allegro":
      return "allegro";
    default:
      return "default";
  }
};

const p = (path: string[]) => path.join("_");

const mkAccessor =
  (path: string, defaultValue?: string | any) => (row: any) => {
    return get(row, path, defaultValue || "");
  };

type PathKeyMap = {
  [key: string]: {
    path: string;
    defaultValue?: any;
  };
};

const urlSuffix = (uri: string) => {
  return uri.substring(
    (uri.includes("#") ? uri.lastIndexOf("#") : uri.lastIndexOf("/")) + 1 ?? 0,
    uri.length,
  );
};
const mkMultiAccessor = (pathKeysMap: PathKeyMap) => (row: any) => {
  return Object.fromEntries(
    Object.entries(pathKeysMap).map(([key, { path, defaultValue }]) => [
      key,
      get(row, path, defaultValue || ""),
    ]),
  );
};
const computeColumns: (
  schema: JSONSchema7,
  path?: string[],
) => MRT_ColumnDef<any>[] = (schema: JSONSchema7, path: string[] = []) =>
  (!schema?.properties
    ? []
    : [
        {
          id: p([...path, "IRI"]),
          header: p([...path, "IRI"]),
          accessorKey: `${p([...path, "entity"])}.value`,
          Cell: ({ cell }) => (
            <OverflowContainer tooltip={cell.getValue()}>
              {urlSuffix(cell.getValue() ?? "")}
            </OverflowContainer>
          ),
        },
        ...Object.keys(filterForPrimitiveProperties(schema.properties)).map(
          (key) => ({
            header: p([...path, key]),
            id: p([...path, key, "single"]),
            maxSize: 400,
            accessorFn: mkAccessor(`${p([...path, key, "single"])}.value`, ""),
            Cell: ({ cell }) => (
              <OverflowContainer>{cell.getValue() ?? ""}</OverflowContainer>
            ),
          }),
        ),
        ...Object.entries(schema.properties || {})
          .filter(
            ([, value]) =>
              typeof value === "object" &&
              value.type === "object" &&
              !value.$ref,
          )
          .map(([key, value]) =>
            isJSONSchema(value) ? computeColumns(value, [...path, key]) : [],
          )
          .flat(),
        ...Object.keys(filterForArrayProperties(schema.properties)).flatMap(
          (key) => [
            {
              header: p([...path, key]),
              id: p([...path, key, "label_group"]),
              maxSize: 500,
              accessorFn: mkMultiAccessor({
                group: {
                  path: `${p([...path, key, "label_group"])}.value`,
                  defaultValue: "",
                },
                count: {
                  path: `${p([...path, key, "count"])}.value`,
                  defaultValue: 0,
                },
              }),
              Cell: ({ cell, table }) => {
                const { group, count } = cell.getValue();
                const table_ = table as MRT_TableInstance<any>;
                return (
                  <Grid
                    container
                    flexWrap={
                      table_.getState().density === "spacious"
                        ? "wrap"
                        : "nowrap"
                    }
                    alignItems={"center"}
                  >
                    <Grid item>
                      <Typography variant={"body2"}>{count}</Typography>
                    </Grid>
                    {!isNil(count) &&
                      count > 0 &&
                      parseMarkdownLinks(group).map(({ label, url }, index) => {
                        return (
                          <Grid item key={url + index} sx={{ m: 0.5 }}>
                            <Link>
                              <OverflowChip entityIRI={url} label={label} />
                            </Link>
                          </Grid>
                        );
                      })}
                  </Grid>
                );
              },
            },
          ],
        ),
      ]) as any as MRT_ColumnDef<any>[];

const alwaysDisplayColumns = ["mrt-row-actions", "IRI"];

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const defsFieldName = (schema as JSONSchema7).definitions
  ? "definitions"
  : "$defs";
export const TypedList = ({ typeName }: Props) => {
  const classIRI = useMemo(() => {
    return sladb(typeName).value;
  }, [typeName]);
  const loadedSchema = useMemo(
    () =>
      ({ ...schema, ...schema[defsFieldName][typeName] }) as
        | JSONSchema7
        | undefined,
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
  const { drawerHeight } = useDrawerDimensions();

  const { crudOptions } = useGlobalCRUDOptions();

  const { data: resultListData, isLoading } = useQuery(
    ["allEntries", classIRI, sorting],
    async () => {
      const sparqlQuery = withDefaultPrefix(
        defaultPrefix,
        jsonSchema2Select(
          loadedSchema,
          classIRI,
          [],
          {
            primaryFields: primaryFields,
            orderBy: sorting.map((s) => ({
              orderBy: s.id,
              descending: s.desc,
            })),
          },
          undefined,
          getFlavour(activeEndpoint),
        ),
      );
      if (!sparqlQuery || !crudOptions?.selectFetch) {
        return;
      }
      const res = await crudOptions.selectFetch(sparqlQuery, {
        withHeaders: true,
      });
      return res;
    },
    { enabled: !!crudOptions?.selectFetch },
  );

  const resultList = useMemo(
    () => resultListData?.results?.bindings ?? [],
    [resultListData],
  );
  const headerVars = useMemo(
    () => resultListData?.head?.vars,
    [resultListData],
  );

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => computeColumns(loadedSchema),
    [loadedSchema],
  );

  const displayColumns = columns; /*useMemo<MRT_ColumnDef<any>[]>(
    () => columns.filter((col) => !headerVars || headerVars.includes(col.id) || alwaysDisplayColumns.includes(col.id)),
    [columns, headerVars],
  );*/

  const router = useModifiedRouter();
  const editEntry = useCallback(
    (id: string) => {
      router.push(`/create/${typeName}?encID=${encodeIRI(id)}`);
    },
    [router, typeName],
  );
  const showEntry = useCallback(
    (id: string) => {
      NiceModal.show(EntityDetailModal, {
        typeIRI: classIRI,
        entityIRI: id,
      });
    },
    [classIRI],
  );
  const extendedSchema = useExtendedSchema({ typeName, classIRI });
  const queryClient = useQueryClient();
  const { mutateAsync: moveToTrashAsync, isLoading: aboutToMoveToTrash } =
    useMutation(
      ["moveToTrash", (id: string | string[]) => id],
      async (id: string | string[]) => {
        if (!id || !crudOptions.updateFetch)
          throw new Error("entityIRI or updateFetch is not defined");
        return moveToTrash(
          id,
          classIRI,
          loadedSchema,
          crudOptions.updateFetch,
          {
            defaultPrefix,
            queryBuildOptions: defaultQueryBuilderOptions,
          },
        );
      },
      {
        onSuccess: async () => {
          console.log("invalidateQueries");
          queryClient.invalidateQueries(["list"]);
          queryClient.invalidateQueries(
            filterUndefOrNull(["allEntries", classIRI || undefined]),
          );
        },
      },
    );
  const { mutateAsync: removeEntity, isLoading: aboutToRemove } = useMutation(
    ["remove", (id: string) => id],
    async (id: string) => {
      if (!id || !crudOptions.updateFetch)
        throw new Error("entityIRI or updateFetch is not defined");
      return remove(id, classIRI, loadedSchema, crudOptions.updateFetch, {
        defaultPrefix,
        queryBuildOptions: defaultQueryBuilderOptions,
      });
    },
    {
      onSuccess: async () => {
        console.log("invalidateQueries");
        queryClient.invalidateQueries(["list"]);
        queryClient.invalidateQueries(
          filterUndefOrNull(["allEntries", classIRI || undefined]),
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
        enqueueSnackbar("About to remove", { variant: "info" });
        return await removeEntity(id);
        enqueueSnackbar("Removed", { variant: "success" });
      });
    },
    [removeEntity, enqueueSnackbar],
  );
  const handleMoveToTrash = useCallback(
    async (id: string) => {
      NiceModal.show(GenericModal, {
        type: "moveToTrash",
      }).then(async () => {
        enqueueSnackbar("About to move to trash", { variant: "info" });
        return await moveToTrashAsync(id);
        enqueueSnackbar("Moved to trash", { variant: "success" });
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
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
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
  };

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

  const { t } = useTranslation();

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    {
      externalId_single: false,
    },
  );

  const handleChangeColumnVisibility = useCallback(
    (s: any) => {
      console.log("handleChangeColumnVisibility", s);
      setColumnVisibility(s);
    },
    [setColumnVisibility],
  );
  /*useEffect(() => {
    const disableList = Object.fromEntries(
      columns
        .filter(
          (col) =>
            !(
              !headerVars ||
              headerVars.includes(col.id) ||
              alwaysDisplayColumns.includes(col.id)
            ),
        )
        .map((col) => [col.id, false]),
    );
    setColumnVisibility({
      ...disableList,
    });
  }, [columnVisibility, headerVars, columns, setColumnVisibility]);
*/
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
    onRowSelectionChange: handleRowSelectionChange,
    manualPagination: false,
    manualSorting: true,
    onSortingChange: handleColumnOrderChange,
    onColumnVisibilityChange: handleChangeColumnVisibility,
    initialState: {
      columnVisibility: { id: true, externalId_single: false },
      pagination: { pageIndex: 0, pageSize: 20 },
    },
    rowCount: resultList.length,
    enableRowActions: true,
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => {
      return (
        <SemanticFormsModal
          open={true}
          askClose={() => table.setCreatingRow(row)}
          schema={extendedSchema as JsonSchema}
          entityIRI={slent(uuidv4()).value}
          typeIRI={classIRI}
        >
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </SemanticFormsModal>
      );
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Button
          variant="contained"
          onClick={() => {
            //table.setCreatingRow(true);
            editEntry(slent(uuidv4()).value);
          }}
        >
          <Add />
        </Button>
        <Button onClick={handleExportData} startIcon={<FileDownload />}>
          Alle Daten exportieren
        </Button>
        <Button
          disabled={table.getRowModel().rows.length === 0}
          //export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={<FileDownload />}
        >
          Aktuelle Seite exportieren
        </Button>
        <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          //only export selected rows
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          startIcon={<FileDownload />}
        >
          Nur ausgewählte Zeilen exportieren
        </Button>
        {table.getIsSomeRowsSelected() && (
          <>
            <IconButton
              onClick={() => handleMoveToTrashSelected(table)}
              color="error"
              aria-label="move to trash"
            >
              <Delete />
            </IconButton>
            <IconButton
              onClick={() => handleRemoveSelected(table)}
              color="error"
              aria-label="delete forever"
            >
              <DeleteForever />
            </IconButton>
          </>
        )}
      </Box>
    ),
    getRowId: (row) =>
      (row as any)?.entity?.value ||
      (row as any)?.originalValue?.entity?.value ||
      slent(uuidv4()).value,
    displayColumnDefOptions: {
      "mrt-row-actions": {
        header: t("actions"),
        minSize: 150,
      },
    },
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex" }}>
        <Tooltip title="Show">
          <IconButton onClick={() => showEntry(row.id)}>
            <OpenInNew />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton onClick={() => editEntry(row.id)}>
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Move to trash">
          <IconButton color="error" onClick={() => handleMoveToTrash(row.id)}>
            <Delete />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete forever">
          <IconButton color="error" onClick={() => handleRemove(row.id)}>
            <DeleteForever />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderRowActionMenuItems: (row) => {
      return [
        <MenuItem
          key={0}
          onClick={() => {
            // View profile logic...
            row.closeMenu();
            editEntry((row.row.getValue("entity") as any).value);
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          bearbeiten
        </MenuItem>,
        <MenuItem
          key={1}
          onClick={() => {
            row.closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <Details />
          </ListItemIcon>
          Details
        </MenuItem>,
      ];
    },
    enableColumnResizing: true,
    onColumnFiltersChange: handleColumnFilterChange,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
  });

  useEffect(() => {
    if (typeName) {
      enqueueSnackbar(t("loading typename", { typeName: t(typeName) }), {
        variant: "info",
      });
      table.reset();
    }
  }, [typeName, enqueueSnackbar, t, table]);

  return (
    <Box sx={{ width: "100%" }}>
      {isLoading && columns.length <= 0 ? (
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

/*
const ListDebuggingTools = ({ jsonData }: ListDebuggingToolsProps) => {
    const { features } = useSettings();
    const { doLocalQuery } = useGlobalCRUDOptions();
    if (!features?.enableDebug) return null;
    return (


      <Grid item
      sx={{
      maxWidth: '1000px',
      overflow: 'auto'
      }}>

          List all {typeName} here.
          <pre>{sparqlQuery}</pre>
          RESULT:
          <JsonView data={resultList} shouldInitiallyExpand={(lvl) => lvl < 3} />
      </Grid>)
}*/
