import {
  and,
  formatIs,
  isArrayObjectControl,
  isBooleanControl,
  isControl,
  isOneOfControl,
  isStringControl,
  rankWith,
} from "@jsonforms/core";
import { OverflowChip, OverflowContainer } from "@slub/edb-basic-components";
import { Checkbox, Grid, Link, Typography } from "@mui/material";
import { JSONSchema7 } from "json-schema";
import isNil from "lodash-es/isNil";
import { parseMarkdownLinks } from "@slub/edb-core-utils";
import * as React from "react";
import {
  MuiTableColumnDefinitionRegistryEntry,
  PrimaryColumnContent,
} from "./listHelper";
import {
  isObjectWithRefControl,
  isPrimitiveControl,
  mkAccessor,
  mkMultiAccessor,
  pathToString,
  singleValueColumnStub,
  titleOf,
  urlSuffix,
} from "./tableRegistryHelper";
import { MRT_TableInstance } from "material-react-table";

export const cellConfigRegistry: MuiTableColumnDefinitionRegistryEntry[] = [
  {
    tester: rankWith(1, isPrimitiveControl),
    columnDef: (typeName, key, schemaDef, t, path, primaryFields) => ({
      ...singleValueColumnStub(path, key, t, titleOf(schemaDef)),
      Cell: ({ cell, renderedCellValue, row, table }) =>
        primaryFields?.[typeName]?.label === key ? (
          <PrimaryColumnContent
            entityIRI={row.original.entity.value}
            typeName={typeName}
            data={row.original}
            density={table.getState().density}
          >
            {renderedCellValue}
          </PrimaryColumnContent>
        ) : (
          <OverflowContainer density={table.getState().density}>
            {renderedCellValue}
          </OverflowContainer>
        ),
    }),
  },
  {
    tester: rankWith(2, and(isControl, formatIs("uri"))),
    columnDef: (typeName, key, schemaDef, t, path) => ({
      ...singleValueColumnStub(path, key, t, titleOf(schemaDef)),
      maxSize: 400,
      Cell: ({ cell }) => (
        <Link href={String(cell.getValue())} target="_blank" component="a">
          <OverflowContainer tooltip={String(cell.getValue())}>
            {decodeURIComponent(urlSuffix(String(cell.getValue()) ?? ""))}
          </OverflowContainer>
        </Link>
      ),
    }),
  },
  {
    tester: rankWith(4, and(isOneOfControl, isStringControl)),
    columnDef: (typeName, key, schemaDef, t, path) => {
      const def = schemaDef as JSONSchema7;
      return {
        ...singleValueColumnStub(path, key, t, titleOf(schemaDef)),
        maxSize: 400,
        filterFn: "equals",
        filterSelectOptions: def.oneOf.map((e: JSONSchema7) => ({
          label: e.title || t(`key_${e.const}`),
          value: e.const,
        })),
        filterVariant: "select",
        Cell: ({ cell, row, table }) => {
          let v: any = cell.getValue();
          if (typeof v === "string" && v.length > 0) {
            const oneOfElement = def.oneOf?.find(
              (e: JSONSchema7) => e.const === v,
            ) as JSONSchema7;
            v = oneOfElement?.title || t(`key_${v}`);
          }
          return (
            <OverflowContainer density={table.getState().density}>
              {v}
            </OverflowContainer>
          );
        },
      };
    },
  },
  {
    tester: rankWith(3, isBooleanControl),
    columnDef: (typeName, key, schemaDef, t, path) => ({
      ...singleValueColumnStub(path, key, t, titleOf(schemaDef)),
      maxSize: 200,
      size: 150,
      filterVariant: "checkbox",
      Cell: ({ cell, row, table }) => {
        const v = cell.getValue();
        return (
          <>
            <Checkbox
              indeterminate={isNil(v) || v === ""}
              checked={v === true || v === "true"}
              disabled={true}
            />
          </>
        );
      },
    }),
  },
  {
    tester: rankWith(2, isArrayObjectControl),
    columnDef: (typeName, key, schemaDef, t, path) => {
      const id = pathToString([...path, key, "label_group"]);
      return {
        header: titleOf(schemaDef) || t(pathToString([...path, key])),
        id,
        maxSize: 500,
        accessorFn: mkAccessor(
          `${pathToString([...path, key, "label_group"])}.value`,
          "",
          (v) =>
            parseMarkdownLinks(v)
              .map(({ label }) => label)
              .join(", "),
        ),
        filterFn: "contains",
        Cell: ({ renderedCellValue, table, row }) => {
          const getValue = mkMultiAccessor({
            group: {
              path: `${pathToString([...path, key, "label_group"])}.value`,
              defaultValue: "",
            },
            count: {
              path: `${pathToString([...path, key, "count"])}.value`,
              defaultValue: 0,
            },
          });
          const { group, count } = getValue(row.original);
          const table_ = table as MRT_TableInstance<any>;
          return (
            count > 0 && (
              <Grid
                container
                flexWrap={
                  table_.getState().density === "spacious" ? "wrap" : "nowrap"
                }
                alignItems={"center"}
              >
                <Grid item>
                  {table.getState().columnFilters.find((cf) => cf.id === id) ? (
                    <OverflowContainer>{renderedCellValue}</OverflowContainer>
                  ) : (
                    <Typography variant={"body2"}>({count})</Typography>
                  )}
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
            )
          );
        },
      };
    },
  },
  {
    tester: rankWith(2, isObjectWithRefControl),
    columnDef: (typeName, key, schemaDef, t, path = []) => {
      const id = pathToString([...path, key, "entity"]);
      const labelPath = pathToString([...path, key, "label"]);
      const descriptionPath = pathToString([...path, key, "description"]);
      const iriPath = pathToString([...path, key, "IRI"]);
      return {
        header: titleOf(schemaDef) || t(pathToString([...path, key])),
        id,
        maxSize: 500,
        filterVariant: "select",
        accessorFn: mkAccessor(`${labelPath}.value`, ""),
        Cell: ({ renderedCellValue, table, row }) => {
          const description = row.original[descriptionPath]?.value;
          const label = row.original[labelPath]?.value;
          const iri = row.original[iriPath]?.value;
          return (
            iri &&
            label?.length > 0 && (
              <OverflowChip
                label={renderedCellValue}
                secondary={description}
                entityIRI={iri}
              />
            )
          );
        },
      };
    },
  },
];
