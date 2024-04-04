import {
  defaultPrefix,
  defaultQueryBuilderOptions,
  sladb,
  slent,
} from "../../form/formConfigs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import schema from "../../../public/schema/Exhibition.schema.json";
import { v4 as uuidv4 } from "uuid";
import { useGlobalCRUDOptions } from "../../state/useGlobalCRUDOptions";
import { jsonSchema2Select } from "../../utils/sparql";
import {
  Box,
  Link,
  Skeleton,
  MenuItem,
  ListItemIcon,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_EditActionButtons,
  MRT_SortingState,
  MRT_Virtualizer,
} from "material-react-table";
import { encodeIRI } from "../../utils/core";
import { JSONSchema7 } from "json-schema";
import { Add, Details, Edit } from "@mui/icons-material";
import { useRouter } from "next/router";
import { primaryFields } from "../../config";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { SemanticFormsModal } from "../../renderer/SemanticFormsModal";
import NiceModal from "@ebay/nice-modal-react";
import GenericModal from "../../form/GenericModal";
import { useSnackbar } from "notistack";
import { JsonSchema } from "@jsonforms/core";
import useExtendedSchema from "../../state/useExtendedSchema";
import Button from "@mui/material/Button";
import { flatten } from "lodash";
import get from "lodash/get";
import { useModifiedRouter } from "../../basic";
import { remove, withDefaultPrefix } from "@slub/sparql-schema";
import {
  filterForArrayProperties,
  filterForPrimitiveProperties,
  isJSONSchema,
} from "@slub/json-schema-utils";
import { parseMarkdownLinks } from "@slub/edb-core-utils";

type Props = {
  typeName: string;
};

const p = (path: string[]) => path.join("_");

const mkAccessor =
  (path: string, defaultValue?: string | any) => (row: any) => {
    return get(row, path, defaultValue || "");
  };
const computeColumns: (
  schema: JSONSchema7,
  path?: string[],
) => MRT_ColumnDef<any>[] = (schema: JSONSchema7, path: string[] = []) =>
  (!schema?.properties
    ? []
    : [
        /*{
    id: p([...path, "id"])
    header: p([...path, "id"]),
    accessorKey: `${p([...path, "entry"])}.value`,
  },*/
        ...Object.keys(filterForPrimitiveProperties(schema.properties)).map(
          (key) => ({
            header: p([...path, key]),
            id: p([...path, key, "single"]),
            accessorFn: mkAccessor(`${p([...path, key, "single"])}.value`, ""),
            Cell: ({ cell }) => <>{cell.getValue() ?? ""}</>,
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
              header: p([...path, key]) + " count",
              id: p([...path, key, "count"]),
              accessorFn: mkAccessor(
                `${(p([...path, key, "count"]), 0)}.value`,
              ),
              Cell: ({ cell }) => (
                <Link href={"#"}>{cell.getValue() ?? 0}</Link>
              ),
            },
            {
              header: p([...path, key]),
              id: p([...path, key, "label_group"]),
              accessorFn: mkAccessor(
                `${(p([...path, key, "label_group"]), "")}.value`,
              ),
              Cell: ({ cell }) => (
                <>
                  {cell.getValue() &&
                    parseMarkdownLinks(cell.getValue()).map(
                      ({ label, url }) => {
                        return (
                          <span key={url}>
                            {" "}
                            <Link href={`/show/${encodeIRI(url)}`}>
                              {label}
                            </Link>{" "}
                          </span>
                        );
                      },
                    )}
                </>
              ),
            },
          ],
        ),
      ]) as any as MRT_ColumnDef<any>[];

const defsFieldName = (schema as JSONSchema7).definitions
  ? "definitions"
  : "$defs";
export const TypedInfiniteList = ({ typeName }: Props) => {
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

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 100,
  });

  const [sorting, setSorting] = useState<MRT_SortingState>([
    { id: "entity", desc: false },
  ]);

  const handleColumnOrderChange = useCallback(
    (s: MRT_SortingState) => {
      setSorting(s);
    },
    [setSorting],
  );

  const { crudOptions } = useGlobalCRUDOptions();

  const { data: resultListData, isLoading } = useQuery(
    ["allEntries", classIRI, sorting],
    async () => {
      const sparqlQuery = withDefaultPrefix(
        defaultPrefix,
        jsonSchema2Select(loadedSchema, classIRI, [], {
          primaryFields: primaryFields,
          orderBy: sorting.map((s) => ({ orderBy: s.id, descending: s.desc })),
        }),
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

  const displayColumns = useMemo<MRT_ColumnDef<any>[]>(
    () => columns.filter((col) => !headerVars || headerVars.includes(col.id)),
    [columns, headerVars],
  );

  const router = useModifiedRouter();
  const editEntry = useCallback(
    (id: string) => {
      router.push(`/create/${typeName}?encID=${encodeIRI(id)}`);
    },
    [router, typeName],
  );
  const extendedSchema = useExtendedSchema({ typeName, classIRI });
  const { mutate: removeEntity } = useMutation(
    ["remove", (id: string) => id],
    async (id: string) => {
      if (!id || !crudOptions.updateFetch)
        throw new Error("entityIRI or updateFetch is not defined");
      return remove(id, classIRI, loadedSchema, crudOptions.updateFetch, {
        defaultPrefix,
        queryBuildOptions: defaultQueryBuilderOptions,
      });
    },
  );
  const { enqueueSnackbar } = useSnackbar();
  const handleRemove = useCallback(
    async (id: string) => {
      NiceModal.show(GenericModal, {
        type: "delete",
      }).then(() => {
        removeEntity(id);
        enqueueSnackbar("Removed", { variant: "success" });
      });
    },
    [removeEntity, enqueueSnackbar],
  );

  const tableContainerRef = useRef<HTMLDivElement>(null); //we can get access to the underlying TableContainer element and react to its scroll events
  const rowVirtualizerInstanceRef =
    useRef<MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null); //we can get access to the underlying Virtualizer instance and call its scrollToIndex method

  const {
    data,
    fetchNextPage,
    isError,
    isFetching,
    isLoading: isInfiniteLoading,
  } = useInfiniteQuery(
    ["infiniteEntries", classIRI, sorting, pagination],
    async ({ pageParam = 0 }) => {
      if (!loadedSchema || !classIRI) return [];
      const sparqlQuery = withDefaultPrefix(
        defaultPrefix,
        jsonSchema2Select(loadedSchema, classIRI, [], {
          primaryFields: primaryFields,
          orderBy: sorting.map((s) => ({ orderBy: s.id, descending: s.desc })),
          limit: pagination.pageSize,
          offset: pageParam * pagination.pageSize + 1,
        }),
      );
      console.log(sparqlQuery);
      if (!sparqlQuery || !crudOptions?.selectFetch) {
        return [];
      }
      const res = await crudOptions.selectFetch(sparqlQuery, {
        withHeaders: false,
      });
      console.log({ res });
      return res || [];
    },
    {
      getNextPageParam: (_lastGroup, groups) => groups.length,
      refetchOnWindowFocus: false,
      enabled: !!classIRI && !!crudOptions?.selectFetch,
    },
  );
  const flatData = useMemo(
    () => (data?.pages ? flatten(data?.pages) : []),
    [data],
  );
  const totalFetched = useMemo(() => flatData?.length || 0, [flatData]);

  useEffect(() => {
    //scroll to the top of the table when the sorting changes
    try {
      rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
    } catch (error) {
      console.error(error);
    }
  }, [sorting, pagination]);

  //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        //once the user has scrolled within 400px of the bottom of the table, fetch more data if we can
        if (
          scrollHeight - scrollTop - clientHeight < 400 &&
          !isFetching &&
          totalFetched < 10000
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched],
  );
  //a check on mount to see if the table is already scrolled to the bottom and immediately needs to fetch more data
  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  return (
    <Box sx={{ width: "100%", height: `calc(100vh - 280px)` }}>
      {columns.length <= 0 ? (
        <Skeleton variant="rectangular" height={"50%"} />
      ) : (
        <>
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={isLoading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
          <MaterialReactTable
            columns={displayColumns}
            data={flatData}
            rowVirtualizerInstanceRef={rowVirtualizerInstanceRef}
            muiTableContainerProps={{
              ref: tableContainerRef, //get access to the table container element
              sx: { maxHeight: "600px" }, //give the table a max height
              onScroll: (event) =>
                fetchMoreOnBottomReached(event.target as HTMLDivElement), //add an event listener to the table container element
            }}
            rowVirtualizerOptions={{ overscan: 4 }}
            enableColumnVirtualization={true}
            enableColumnOrdering //enable some features
            enableRowSelection
            manualPagination={true}
            manualSorting={true}
            onSortingChange={handleColumnOrderChange}
            initialState={{
              columnVisibility: { id: false, externalId_single: false },
            }}
            onPaginationChange={setPagination}
            rowCount={resultList.length * 3}
            enableRowActions={true}
            renderCreateRowDialogContent={({
              table,
              row,
              internalEditComponents,
            }) => {
              return (
                <SemanticFormsModal
                  open={true}
                  askClose={() => table.setCreatingRow(row)}
                  schema={extendedSchema as JsonSchema}
                  entityIRI={slent(uuidv4()).value}
                  typeIRI={classIRI}
                >
                  <MRT_EditActionButtons
                    variant="text"
                    table={table}
                    row={row}
                  />
                </SemanticFormsModal>
              );
            }}
            renderEditRowDialogContent={({
              table,
              row,
              internalEditComponents,
            }) => {
              return (
                <SemanticFormsModal
                  open={true}
                  askClose={() => table.setEditingRow(row)}
                  schema={extendedSchema as JsonSchema}
                  entityIRI={row.id}
                  typeIRI={classIRI}
                >
                  <MRT_EditActionButtons
                    variant="text"
                    table={table}
                    row={row}
                  />
                </SemanticFormsModal>
              );
            }}
            renderTopToolbarCustomActions={({ table }) => (
              <Box sx={{ display: "flex", gap: "1rem" }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    table.setCreatingRow(true);
                  }}
                >
                  <Add />
                </Button>
              </Box>
            )}
            getRowId={(row) => (row as any)?.entity?.value || uuidv4()}
            renderRowActionMenuItems={(row) => {
              return [
                <MenuItem
                  key={0}
                  onClick={() => {
                    // View profile logic...
                    row.closeMenu();
                    editEntry(row.row.id);
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
            }}
            state={{
              pagination,
              sorting,
            }}
          />
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
