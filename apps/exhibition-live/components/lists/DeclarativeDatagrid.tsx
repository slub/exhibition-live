import "@inovua/reactdatagrid-community/index.css";

import DataGrid from "@inovua/reactdatagrid-community";
import BoolEditor from "@inovua/reactdatagrid-community/BoolEditor";
import BoolFilter from "@inovua/reactdatagrid-community/BoolFilter";
import DateFilter from "@inovua/reactdatagrid-community/DateFilter";
import NumberFilter from "@inovua/reactdatagrid-community/NumberFilter";
import StringFilter from "@inovua/reactdatagrid-community/StringFilter";
import {
  TypeColumn,
  TypeComputedProps,
  TypeDataGridProps,
  TypeFilterValue,
  TypeSingleFilterValue,
} from "@inovua/reactdatagrid-community/types";
import { TypeColumns } from "@inovua/reactdatagrid-community/types/TypeColumn";
import { TypeOnSelectionChangeArg } from "@inovua/reactdatagrid-community/types/TypeDataGridProps";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { extendSxProp } from "@mui/system";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { filterUndefOrNull } from "@slub/edb-ui-utils";
import { ColumnRaw } from "./datagrid/columnRaw";
import extendedFilter from "./datagrid/extendedFilter";
import { transformValue } from "./datagrid/tableValueMapper";

//global.moment = moment

export type DeclarativeDataGridProps<T extends { [k: string]: any }> = {
  data?: T[];
  onFilteredDataChange?: (data: T[]) => void;
  columnsRaw: ColumnRaw[];
  firstColumns?: TypeColumns;
  onRowSelect?: (id: string) => void;
  selectedId?: string | null;
  debugEnabled: boolean;
} & Partial<TypeDataGridProps>;

const filterMappings = {
  string: StringFilter,
  boolean: BoolFilter,
  number: NumberFilter,
  date: DateFilter,
};
const editorMappings = {
  boolean: BoolEditor,
};
const operatorsForType = {
  number: "gte",
  string: "contains",
  date: "beforeOrOn",
  boolean: "eq",
};

type CustomRendererMatcher = {
  match: { [key: string]: any };
  render: (...args: any[]) => ReactNode;
};

function Email({ value }: { value: string }) {
  const href = `mailto:${value}`;
  return <a href={href}>{value}</a>;
}

function Phone({ value }: { value: string }) {
  const href = `tel:${value}`;
  return <a href={href}>{value}</a>;
}

const customRendererForType: CustomRendererMatcher[] = [
  {
    match: { type: "boolean" },
    render: ({ value }) => (!!value ? <CheckBox /> : <CheckBoxOutlineBlank />),
  },
  {
    match: { type: "string", name: "contact_email" },
    render: Email,
  },
  {
    match: { type: "string", name: "contact_phone" },
    render: Phone,
  },
];

const findMatchingRenderer = (c: Partial<ColumnRaw>) =>
  customRendererForType.find((d) =>
    Object.keys(d.match).reduce<boolean>(
      (prev, cur) => prev && (c as any)[cur] === d.match[cur],
      true,
    ),
  )?.render;

const columns = (columnsRaw: ColumnRaw[], firstColumns?: TypeColumns) => [
  ...(firstColumns || []),
  ...columnsRaw.map((c) => ({
    ...c,
    render: findMatchingRenderer(c) || undefined,
    filterEditor:
      filterMappings[c.type as "string" | "number" | "boolean" | "date"],
    editor: editorMappings[c.type as "boolean"],
  })),
];

function defaultFilterValue(columnsRaw: ColumnRaw[]) {
  return columnsRaw
    .filter(
      ({ type }) =>
        type && ["string", "number", "boolean", "date"].includes(type),
    )
    .map(({ name, type, options }) => {
      return {
        name,
        type,
        value: null,
        operator:
          options?.filter?.operator ||
          operatorsForType[type as "string" | "number" | "date" | "boolean"],
      } as unknown as TypeSingleFilterValue;
    });
}

const DeclarativeDataGrid = <T extends { [k: string]: any }>({
  data,
  onFilteredDataChange,
  columnsRaw,
  onRowSelect,
  selectedId,
  firstColumns,
  debugEnabled,
  ...props
}: DeclarativeDataGridProps<T>) => {
  const [dataSource, setDataSource] = useState<T[]>([]);
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [filterValue, setFilterValue] = useState<TypeFilterValue | undefined>(
    defaultFilterValue(columnsRaw),
  );

  const filterValueChangeHandler = useCallback(
    (_filterValue?: TypeFilterValue) => {
      setFilterValue(_filterValue);
    },
    [setFilterValue],
  );

  const filterAndSetData = useCallback(() => {
    if (!filterValue) {
      setFilteredData(dataSource);
      onFilteredDataChange && onFilteredDataChange(dataSource);
      return;
    }
    const data = extendedFilter(dataSource, filterValue, columnsRaw);
    onFilteredDataChange && onFilteredDataChange(data);
    setFilteredData(data);
  }, [
    columnsRaw,
    dataSource,
    onFilteredDataChange,
    setFilteredData,
    filterValue,
  ]);

  useEffect(() => {
    filterAndSetData();
  }, [columnsRaw, dataSource, filterValue, filterAndSetData]);

  useEffect(() => {
    if (!data) return;
    const _data = filterUndefOrNull(data).map((v) =>
      transformValue(v, columnsRaw),
    );

    _data && setDataSource(_data);
  }, [columnsRaw, data]);

  const gridRef = useRef<TypeComputedProps | null>(null);
  const scrollTo = useCallback(
    (id: string) => {
      gridRef.current?.scrollToId(id, { duration: 300 });
    },
    [gridRef],
  );

  /*
  const debugPrint = useCallback((selectedId) => {
    debugEnabled && console.log({selectedData: data.filter(d => (d as any).id === selectedId)})
  }, [data, debugEnabled])*/

  useEffect(() => {
    selectedId && scrollTo(selectedId);
  }, [selectedId, scrollTo]);

  const handleRowSelect = useCallback(
    ({ selected }: TypeOnSelectionChangeArg) => {
      typeof selected === "string" && onRowSelect && onRowSelect(selected);
    },
    [onRowSelect],
  );

  const activeIndex2RowSelect = useCallback(
    (index: number) => {
      try {
        // @ts-ignore
        const t = gridRef.current?.getRowId(index) as string | undefined;
        typeof t === "string" && onRowSelect && onRowSelect(t);
      } catch (e) {}
    },
    [onRowSelect, gridRef],
  );

  return (
    <DataGrid
      idProperty="id"
      filterable
      onReady={(computedPropsRef) =>
        (gridRef.current = computedPropsRef.current)
      }
      showColumnMenuFilterOptions={true}
      showFilteringMenuItems={true}
      filterValue={filterValue}
      onFilterValueChange={filterValueChangeHandler}
      rowIndexColumn
      enableColumnAutosize={false}
      columns={columns(columnsRaw, firstColumns) as TypeColumn[]}
      dataSource={filteredData}
      style={{ height: "100%" }}
      selected={selectedId}
      onSelectionChange={handleRowSelect}
      onActiveIndexChange={activeIndex2RowSelect}
      {...props}
    />
  );
};

export default DeclarativeDataGrid;
