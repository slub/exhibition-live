import get from "lodash/get";
import {JSONSchema7, JSONSchema7Definition} from "json-schema";
import {MRT_ColumnDef, MRT_TableInstance} from "material-react-table";
import {OverflowContainer} from "../../lists";
import {
  isJSONSchema, isPrimitive,
} from "@slub/json-schema-utils";
import {Avatar, Box, Checkbox, Grid, Link, Typography} from "@mui/material";
import isNil from "lodash/isNil";
import maxBy from 'lodash/maxBy';
import {filterUndefOrNull, parseMarkdownLinks} from "@slub/edb-core-utils";
import {OverflowChip} from "../../lists/OverflowChip";
import * as React from "react";
import {TFunction} from "i18next";
import {MouseEvent, useCallback, useMemo} from "react";
import NiceModal from "@ebay/nice-modal-react";
import {EntityDetailModal} from "../../form/show";
import {primaryFields} from "../../config";
import {PrimaryField} from "@slub/edb-core-types";
import {applyToEachField} from "../../utils/mapping/simpleFieldExtractor";
import {FieldExtractDeclaration} from "../../utils/types";
import {
  and, formatIs, isArrayObjectControl, isBooleanControl, isControl,
  isOneOfControl,
  isStringControl,
  JsonSchema,
  RankedTester,
  rankWith, Tester, TesterContext
} from "@jsonforms/core";

const p = (path: string[]) => path.join("_");
export const mkAccessor =
  (path: string, defaultValue?: string | any, fn?: (v: any) => any) => (row: any) => {
    const raw = get(row, path, defaultValue || "");
    return fn ? fn(raw) : raw
  };
type PathKeyMap = {
  [key: string]: {
    path: string;
    defaultValue?: any;
  };
};
export const urlSuffix = (uri: string) => {
  return uri.substring(
    (uri.includes("#") ? uri.lastIndexOf("#") : uri.lastIndexOf("/")) + 1 ?? 0,
    uri.length,
  );
};
export const mkMultiAccessor = (pathKeysMap: PathKeyMap) => (row: any) => {
  return Object.fromEntries(
    Object.entries(pathKeysMap).map(([key, {path, defaultValue}]) => [
      key,
      get(row, path, defaultValue || ""),
    ]),
  );
};

const extractSingleFieldIfString = (
  entry: any | null,
  fieldExtractDeclaration: FieldExtractDeclaration,
): string | null => {
  try {
    if (typeof fieldExtractDeclaration !== "string") {
      return  null
    }
    const value = entry[`${fieldExtractDeclaration}_single`]?.value
    if (typeof value !== "string") {
      return null;
    } else {
      return value;
    }
  } catch (e) {
    return null;
  }
};

type PrimaryColumnContentProps = {
  entityIRI: string,
  typeName: string,
  children: React.ReactNode,
  data: any,
  density?: 'comfortable' | 'compact' | 'spacious';
}
export const PrimaryColumnContent = ({entityIRI, typeName, children, data, density}: PrimaryColumnContentProps) => {


  const primaryContent = useMemo(() => {
    const fieldDecl = primaryFields[typeName] as PrimaryField | undefined;
    if (data && fieldDecl)
      return applyToEachField(data, fieldDecl, extractSingleFieldIfString);
    return {
      label: null,
      description: null,
      image: null,
    };
  }, [data, typeName])
  const showDetailModal = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      NiceModal.show(EntityDetailModal, { entityIRI, data: {} });
    },
    [entityIRI],
  );

  return <Link
    component="button"
    variant="body2"
    onClick={showDetailModal}
    underline={"hover"}
    color={"inherit"}
  >
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}
  >
    {primaryContent.image && <Avatar
      alt="avatar"
      variant={typeName.toLowerCase().includes("person") ? "circular" : "rounded"}
      sx={density === "compact" ? { width: 24, height: 24 } : { width: 42, height: 42 }}
      src={primaryContent.image}
    />}
    {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
    <OverflowContainer tooltip={children}>{children}</OverflowContainer>
  </Box>
  </Link>

}
type ComputeColumnDefFunction<T = any> = (typeName:string, key: string, schemaDef: JSONSchema7Definition, t: TFunction,  path?: string[]) => MRT_ColumnDef<T>
export interface MuiTableColumnDefinitionRegistryEntry<T = any> {
  tester: RankedTester;
  columnDef: ComputeColumnDefFunction<T>
}

/**
 * generates Column Definition stub with header, id and accessorFn for a single value column
 *
 * each part  will look like `path_to_key_single`
 * translation needs to be provided in the form of `path_to_key` using the t-function
 *
 * @param path path to the key (empty array for root)
 * @param key last part of the path
 * @param t translation function
 */
const singleValueColumnStub: (path: string[], key: string, t: TFunction, label?: string) => Pick<MRT_ColumnDef<any>, "header" | "id" | "accessorFn"> = (path, key, t, label) => ({
  header: label || t(p([...path, key])),
  id: p([...path, key, "single"]),
  accessorFn: mkAccessor(`${p([...path, key, "single"])}.value`, "")
})

const isPrimitiveControl: Tester = (_, schema) => typeof schema.type === "string" && isPrimitive(schema.type)

const isObjectWithRefControl: Tester = (uischema, schema) => schema.$ref && isControl(uischema)

const titleOf = (schema: JSONSchema7Definition ) => (schema as JSONSchema7)?.title

const cellConfigRegistry: MuiTableColumnDefinitionRegistryEntry[] = [
  {
    tester: rankWith(1, isPrimitiveControl  ),
    columnDef: (typeName, key, schemaDef, t, path) =>  ({
      ...singleValueColumnStub(path, key, t, titleOf(schemaDef)),
      Cell: ({cell, renderedCellValue, row, table}) => (
        primaryFields[typeName]?.label === key
          ? <PrimaryColumnContent
            entityIRI={row.original.entity.value}
            typeName={typeName}
            data={row.original}
            density={table.getState().density}
          >{renderedCellValue}</PrimaryColumnContent>
          : <OverflowContainer density={table.getState().density}>{renderedCellValue}</OverflowContainer>
      ),
    })
  },
  {
    tester: rankWith(2, and(isControl, formatIs("uri") )),
    columnDef: (typeName, key, schemaDef, t, path) => ({
      ...singleValueColumnStub(path, key, t, titleOf(schemaDef)),
      maxSize: 400,
      Cell: ({cell}) => (
          <Link href={(String(cell.getValue()))} target="_blank" component="a">
            <OverflowContainer tooltip={String(cell.getValue())}>
              {decodeURIComponent(urlSuffix(String(cell.getValue()) ?? ""))}
            </OverflowContainer>
          </Link>
        ),
    })
  },
  {
    tester: rankWith(4, and(isOneOfControl, isStringControl )),
    columnDef: (typeName, key, schemaDef, t, path) => {
      const def = schemaDef as JSONSchema7;
      return ({
        ...singleValueColumnStub(path, key, t, titleOf(schemaDef)),
        maxSize: 400,
        filterFn: 'equals',
        filterSelectOptions: def.oneOf.map((e: JSONSchema7) => ({label: e.title || t(`key_${e.const}`), value: e.const})),
        filterVariant: 'select',
        Cell: ({cell, row, table}) => {
          let v: any = cell.getValue()
          if(typeof v === "string" && v.length >  0) {
            const oneOfElement = def.oneOf?.find((e: JSONSchema7) => e.const === v) as JSONSchema7;
            v = oneOfElement?.title || t(`key_${v}`);
          }
          return (
            <OverflowContainer density={table.getState().density}>{v}</OverflowContainer>
          );
        },
      });
    }
  },
  {
    tester: rankWith(3, isBooleanControl),
    columnDef: (typeName, key, schemaDef, t, path) => ({
      ...singleValueColumnStub(path, key, t, titleOf(schemaDef)),
      maxSize: 200,
      size: 150,
      filterVariant: 'checkbox',
      Cell: ({cell, row, table}) => {
        const v = cell.getValue();
        return (
          <>
            <Checkbox  indeterminate={isNil(v) || v === ""} checked={v === true || v === "true"} disabled={true} />
          </>
        );
      }
    })
  },
  {
    tester: rankWith(2, isArrayObjectControl),
    columnDef: (typeName, key, schemaDef, t, path) => {
      const id = p([...path, key, "label_group"])
      return {
        header: titleOf(schemaDef) || t(p([...path, key])),
        id,
        maxSize: 500,
        accessorFn: mkAccessor(
          `${p([...path, key, "label_group"])}.value`,
          "",
          (v) => parseMarkdownLinks(v).map(({label}) => label).join(", "),
        ),
        filterFn: "contains",
        Cell: ({renderedCellValue, table, row}) => {
          const getValue = mkMultiAccessor({
            group: {
              path: `${p([...path, key, "label_group"])}.value`,
              defaultValue: "",
            },
            count: {
              path: `${p([...path, key, "count"])}.value`,
              defaultValue: 0,
            },
          })
          const {group, count} = getValue(row.original);
          const table_ = table as MRT_TableInstance<any>;
          return count > 0 && (
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
                {table.getState().columnFilters.find(cf => cf.id === id)
                  ?  <OverflowContainer>{renderedCellValue}</OverflowContainer>
                  : <Typography variant={"body2"}>({count})</Typography> }
              </Grid>
              {!isNil(count) &&
                count > 0 &&
                parseMarkdownLinks(group).map(({label, url}, index) => {
                  return (
                    <Grid item key={url + index} sx={{m: 0.5}}>
                      <Link>
                        <OverflowChip entityIRI={url} label={label}/>
                      </Link>
                    </Grid>
                  );
                })}
            </Grid>
          );
        }
      }
    }
  }, {
    tester: rankWith(2, isObjectWithRefControl),
    columnDef: (typeName, key, schemaDef, t, path) => {
      const id = p([...path, key, "entity"])
      const labelPath = p([...path, key, "label"])
      const descriptionPath = p([...path, key, "description"])
      const iriPath = p([...path, key, "IRI"])
      return {
        header: titleOf(schemaDef) || t(p([...path, key])),
        id,
        maxSize: 500,
        filterVariant: "select",
        accessorFn: mkAccessor(`${labelPath}.value`, ""),
        Cell: ({renderedCellValue, table, row}) => {
          const description = row.original[descriptionPath]?.value
          const label = row.original[labelPath]?.value
          const iri = row.original[iriPath]?.value
          return iri && label?.length > 0 && <OverflowChip label={renderedCellValue} secondary={description} entityIRI={iri}/>
        }
      }
    }
  }
]


export const defaultColumnDefinitionStub:
  (typeName:string,
   key: string,
   schemaDef: JSONSchema7Definition,
   rootSchema: JSONSchema7,
   t: TFunction,
   path?: string[]) => MRT_ColumnDef<any> =
  (typeName,
   key,
   schemaDef,
   rootSchema,
   t,
   path = []) => {

  const testerContext: TesterContext = {
    rootSchema: rootSchema as JsonSchema,
    config: {}
  }
  const uiSchema = {
    type: "Control",
    scope: `#/properties/${key}`
  }

  const columnDef = maxBy(cellConfigRegistry, (entry) => {
    const tested = entry.tester(uiSchema, schemaDef as JsonSchema, testerContext);
    return tested
  })
    const rank =  columnDef.tester(uiSchema, schemaDef as JsonSchema, testerContext)
  //console.log({columnDef})
  return rank > 0 ?  columnDef.columnDef(typeName, key, schemaDef, t, path) : null
}



export type ColumnDefMatcher<TData = any> = (key: string, schemaDef: JSONSchema7Definition, typeName: string, t: TFunction, path?: string[]) => MRT_ColumnDef<TData> | null
export const computeColumns: (
  schema: JSONSchema7,
  typeName: string,
  t: TFunction,
  matcher?: ColumnDefMatcher,
  path?: string[],
) => MRT_ColumnDef<any>[] = (schema, typeName, t , matcher,  path = []) =>
  (!schema?.properties
    ? []
    : [
      {
        id: p([...path, "IRI"]),
        header: p([...path, "IRI"]),
        accessorKey: `${p([...path, "entity"])}.value`,
        Cell: ({cell}) => (
          <OverflowContainer tooltip={cell.getValue()}>
            {urlSuffix(cell.getValue() ?? "")}
          </OverflowContainer>
        ),
      },
      ...filterUndefOrNull(Object.entries(schema.properties).map(
        ([key, propertyDefinition], index): MRT_ColumnDef<any> => {
          const columnDefinition =  matcher ? matcher(key, propertyDefinition, typeName, t, path) : null
          return columnDefinition || defaultColumnDefinitionStub(typeName, key, propertyDefinition, schema, t, path);
        },
      )),
      ...Object.entries(schema.properties || {})
        .filter(
          ([, value]) =>
            typeof value === "object" &&
            value.type === "object" &&
            !value.$ref,
        )
        .map(([key, value]) =>
          isJSONSchema(value) ? computeColumns(value,typeName , t, matcher, [...path, key]) : [],
        )
        .flat(),
    ]) as any as MRT_ColumnDef<any>[];
