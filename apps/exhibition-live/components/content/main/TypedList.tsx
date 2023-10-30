import { defaultPrefix, sladb } from "../../form/formConfigs";
import { useCallback, useEffect, useMemo, useState } from "react";
import useExtendedSchema from "../../state/useExtendedSchema";
import schema from "../../../public/schema/Exhibition.schema.json";
import { useGlobalCRUDOptions } from "../../state/useGlobalCRUDOptions";
import { jsonSchema2Select } from "../../utils/sparql/jsonSchema2Select";
import { JsonView } from "react-json-view-lite";
import {
  Box,
  Grid,
  Link,
  Skeleton,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { MaterialReactTable, MRT_ColumnDef } from "material-react-table";
import {
  filterForPrimitiveProperties,
  filterForArrayProperties,
  encodeIRI,
} from "../../utils/core";
import { useSettings } from "../../state/useLocalSettings";
import { JSONSchema7 } from "json-schema";
import { Details, Edit } from "@mui/icons-material";
import { useRouter } from "next/router";

type Props = {
  typeName: string;
};

const defsFieldName = (schema as JSONSchema7).definitions
  ? "definitions"
  : "$defs";
export const TypedList = ({ typeName }: Props) => {
  const classIRI = useMemo(() => {
    return sladb(typeName).value;
  }, [typeName]);
  const loadedSchema = useMemo(
    () => schema[defsFieldName][typeName] as JSONSchema7 | undefined,
    [typeName],
  );
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { crudOptions } = useGlobalCRUDOptions();
  const sparqlQuery = useMemo(() => {
    if (!loadedSchema || !classIRI) return;
    return (
      `PREFIX : <${defaultPrefix}> \n` +
      jsonSchema2Select(loadedSchema, classIRI, [], { limit: 10000 })
    );
  }, [loadedSchema, classIRI]);

  const [resultList, setResultList] = useState([]);

  useEffect(() => {
    if (!sparqlQuery || !crudOptions?.selectFetch) {
      return;
    }
    crudOptions.selectFetch(sparqlQuery, { withHeaders: false }).then((res) => {
      setResultList(res);
    });
  }, [sparqlQuery, crudOptions?.selectFetch, setResultList]);

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () =>
      !loadedSchema?.properties
        ? []
        : [
            {
              id: "ID",
              header: "ID",
              accessorKey: "entity.value",
            },
            ...Object.keys(
              filterForPrimitiveProperties(loadedSchema.properties),
            ).map((key) => ({
              header: key,
              id: key,
              accessorKey: `${key}_single.value`,
              Cell: ({ cell }) => <>{cell.getValue() ?? ""}</>,
            })),
            ...Object.keys(
              filterForArrayProperties(loadedSchema.properties),
            ).map((key) => ({
              header: key,
              id: key,
              accessorKey: `${key}_count.value`,
              Cell: ({ cell }) => (
                <Link href={"#"}>{cell.getValue() ?? 0}</Link>
              ),
            })),
          ],
    [loadedSchema],
  );

  const router = useRouter();
  const editEntry = useCallback(
    (id: string) => {
      router.push(`/create/${typeName}/${encodeIRI(id)}`);
    },
    [router, typeName],
  );

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      {!resultList || columns.length <= 0 ? (
        <Skeleton variant="rectangular" height={530} />
      ) : (
        <MaterialReactTable
          columns={columns}
          data={resultList}
          enableColumnOrdering //enable some features
          enableRowSelection
          manualPagination={false}
          initialState={{ columnVisibility: { ID: false, externalId: false } }}
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
                  console.log({ row });
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
