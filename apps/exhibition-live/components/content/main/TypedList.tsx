import { defaultPrefix, sladb } from "../../form/formConfigs";
import { useCallback, useEffect, useMemo, useState } from "react";
import schema from "../../../public/schema/Exhibition.schema.json";
import { useGlobalCRUDOptions } from "../../state/useGlobalCRUDOptions";
import { jsonSchema2Select } from "../../utils/sparql/jsonSchema2Select";
import {
  Box,
  Grid,
  Link,
  Skeleton,
  MenuItem,
  ListItemIcon,
  Tab,
  Tabs,
  CssBaseline,
} from "@mui/material";
import { MaterialReactTable, MRT_ColumnDef } from "material-react-table";
import {
  filterForPrimitiveProperties,
  filterForArrayProperties,
  encodeIRI,
  isJSONSchema,
} from "../../utils/core";
import { JSONSchema7 } from "json-schema";
import { Details, Edit } from "@mui/icons-material";
import { useRouter } from "next/router";
import { primaryFields } from "../../config";
import { parseMarkdownLinks } from "../../utils/core/parseMarkdownLink";

type Props = {
  typeName: string;
};

const p = (path: string[]) => path.join("_");
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
            accessorKey: `${p([...path, key, "single"])}.value`,
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
              accessorKey: `${p([...path, key, "count"])}.value`,
              Cell: ({ cell }) => (
                <Link href={"#"}>{cell.getValue() ?? 0}</Link>
              ),
            },
            {
              header: p([...path, key]),
              id: p([...path, key, "label_group"]),
              accessorKey: `${p([...path, key, "label_group"])}.value`,
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
export const TypedList = ({ typeName }: Props) => {
  const [tabValue, setTabValue] = useState(typeName);
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
  const [headerVars, setHeaderVars] = useState<string[] | undefined>();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { crudOptions } = useGlobalCRUDOptions();
  const sparqlQuery = useMemo(() => {
    if (!loadedSchema || !classIRI) return;
    return (
      `PREFIX : <${defaultPrefix}> \n` +
      jsonSchema2Select(loadedSchema, classIRI, [], {
        limit: 10000,
        primaryFields: primaryFields,
      })
    );
  }, [loadedSchema, classIRI]);

  const [resultList, setResultList] = useState([]);

  useEffect(() => {
    if (!sparqlQuery || !crudOptions?.selectFetch) {
      return;
    }
    crudOptions.selectFetch(sparqlQuery, { withHeaders: true }).then((res) => {
      setResultList(res?.results?.bindings ?? []);
      setHeaderVars(res?.head?.vars);
    });
  }, [sparqlQuery, crudOptions?.selectFetch, setResultList, setHeaderVars]);

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => computeColumns(loadedSchema),
    [loadedSchema],
  );

  const displayColumns = useMemo<MRT_ColumnDef<any>[]>(
    () => columns.filter((col) => !headerVars || headerVars.includes(col.id)),
    [columns, headerVars],
  );

  const router = useRouter();
  const editEntry = useCallback(
    (id: string) => {
      router.push(`/create/${typeName}/${encodeIRI(id)}`);
    },
    [router, typeName],
  );

  const VerticalTabs = () => {
    const handleTabChange = useCallback(
      (event: React.SyntheticEvent, newValue: any) => {
        setTabValue(newValue);
        router.push(`/list/${newValue}`);
      },
      [router, setTabValue],
    );
    return (
      <Tabs
        value={tabValue}
        textColor="secondary"
        indicatorColor="secondary"
        orientation="vertical"
        variant="scrollable"
        onChange={handleTabChange}
      >
        {Object.entries(
          loadedSchema.definitions || loadedSchema["$defs"] || {},
        ).map(([key, value]) => (
          <Tab key={key} value={key} label={key} />
        ))}
      </Tabs>
    );
  };

  const TableWithTabNavigation = ({ children }) => {
    return (
      <Grid container>
        <CssBaseline />
        <Grid container item xs={2}>
          <VerticalTabs />
        </Grid>
        <Grid container item xs={10}>
          {children}
        </Grid>
      </Grid>
    );
  };

  return (
    <>
      {!resultList || columns.length <= 0 ? (
        <Skeleton variant="rectangular" height={530} />
      ) : (
        <TableWithTabNavigation>
          <MaterialReactTable
            columns={displayColumns}
            data={resultList}
            enableColumnOrdering //enable some features
            enableRowSelection
            manualPagination={false}
            initialState={{
              columnVisibility: { id: false, externalId_single: false },
            }}
            onPaginationChange={setPagination}
            rowCount={resultList.length}
            enableRowActions={true}
            getRowId={(row) => (row as any).entity.value}
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
            }}
          />
        </TableWithTabNavigation>
      )}
    </>
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
