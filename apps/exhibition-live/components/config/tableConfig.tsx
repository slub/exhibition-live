import { MRT_ColumnDef } from "material-react-table";
import { TFunction } from "i18next";
import { specialDate2LocalDate } from "@slub/edb-ui-utils";
import { mkAccessor, TableConfigRegistry } from "@slub/edb-table-components";
const p = (path: string[]) => path.join("_");
const dateColDef: (
  key: string,
  t: TFunction,
  path?: string[],
) => MRT_ColumnDef<any> = (key, t, path) => {
  const columnDef: MRT_ColumnDef<any> = {
    header: t(p([...path, key])),
    id: p([...path, key, "single"]),
    accessorFn: mkAccessor(`${p([...path, key, "single"])}.value`, "", (v) => {
      try {
        return typeof v === "string" ||
          (typeof v === "number" && String(v).length === 8)
          ? specialDate2LocalDate(Number(v), "de")
          : String(v);
      } catch (error) {
        console.error("Error processing date:", error);
        return String(v);
      }
    }),
    filterVariant: "date",
    filterFn: "betweenInclusive",
    sortingFn: "datetime",
    Cell: ({ cell }) => {
      const val = cell.getValue<string>();
      return val || "";
    },
    Header: ({ column }) => <em>{column.columnDef.header}</em>,
    muiFilterTextFieldProps: {
      sx: {
        minWidth: "250px",
      },
    },
  };
  return columnDef;
};
export const tableConfig: TableConfigRegistry = {
  default: {
    columnVisibility: {
      IRI: false,
      externalId_single: false,
      idAuthority_IRI: false,
    },
  },
  Exhibition: {
    columnVisibility: {
      IRI: false,
      idAuthority_IRI: false,
      externalId_single: false,
      subtitle_single: false,
      originalTitle_single: false,
      published_single: false,
      editorNote_single: false,
      exhibitionweblink_single: false,
      image_single: false,
      startDate_IRI: false,
      startDate_dateModifier_single: false,
      endDate_IRI: false,
      endDate_dateModifier_single: false,
      finissage_IRI: false,
      finissage_dateValue_single: false,
      midissage_IRI: false,
      midissage_dateValue_single: false,
      vernissage_IRI: false,
      vernissage_dateValue_single: false,
      involvedPersons_label_group: false,
      involvedCorporations_label_group: false,
      exponats_label_group: false,
      resources_label_group: false,
      placesUnknown_single: false,
    },
    matcher: (key, schemaDef, typeName, t, path) => {
      if (key === "dateValue") {
        return dateColDef(key, t, path);
      }
      return null;
    },
  },
  Person: {
    matcher: (key, schemaDef, typeName, t, path) => {
      if (key === "birthDate" || key === "deathDate") {
        return dateColDef(key, t, path);
      }
      return null;
    },
  },
  Workplace: {
    matcher: (key, schemaDef, typeName, t, path) => {
      if (key === "fromDate" || key === "toDate") {
        return dateColDef(key, t, path);
      }
    },
  },
};
