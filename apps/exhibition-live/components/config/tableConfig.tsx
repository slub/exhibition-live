import {VisibilityState} from "@tanstack/table-core"
import {ColumnDefMatcher, mkAccessor} from "../content/list/listHelper";
import {MRT_ColumnDef} from "material-react-table";
import {getJSDate} from "@slub/edb-core-utils";
import {TFunction} from "i18next";
export type ListConfigType = {
  columnVisibility: VisibilityState
  matcher: ColumnDefMatcher
}
export type TableConfigRegistry = {
  default: Partial<ListConfigType>
  [typeName: string]: Partial<ListConfigType>
}
const p = (path: string[]) => path.join("_");

const numeric2JSDate  = (value: number | string) => {
  const numericDate = typeof value === 'string' ? parseInt(value) : value
  if(isNaN(numericDate)) {
    return 0
  }
  return getJSDate(numericDate)
}

const dateColDef: (key: string, t: TFunction, path?: string[]) => MRT_ColumnDef<any> = (key, t, path) => {
  const columnDef: MRT_ColumnDef<any> =  {
    header: t( p([...path, key])),
    id: p([...path, key, "single"]),
    accessorFn: mkAccessor(`${p([...path, key, "single"])}.value`, "", numeric2JSDate),
    filterVariant: 'date',
    filterFn: 'betweenInclusive',
    sortingFn: 'datetime',
    Cell: ({ cell }) => {
      const val =  cell.getValue<Date>()
      return val && typeof val.toLocaleDateString === "function"? val.toLocaleDateString() : ""
    },
    Header: ({ column }) => <em>{column.columnDef.header}</em>,
    muiFilterTextFieldProps: {
      sx: {
        minWidth: '250px',
      }
    }
  }
  return columnDef
}
export const tableConfig: TableConfigRegistry = {
  default: {
    columnVisibility: {
      "IRI": false,
      "externalId_single": false,
    }
  },
  "Exhibition": {
    columnVisibility: {
      "IRI": false,
      "externalId_single": false,
      "subtitle_single": false,
      "originalTitle_single": false,
      "published_single": false,
      "editorNote_single": false,
      "exhibitionweblink_single": false,
      "image_single": false,
      "startDate_IRI": false,
      "startDate_dateModifier_single": false,
      "endDate_IRI": false,
      "endDate_dateModifier_single": false,
      "finissage_IRI": false,
      "finissage_dateValue_single": false,
      "midissage_IRI": false,
      "midissage_dateValue_single": false,
      "vernissage_IRI": false,
      "vernissage_dateValue_single": false,
      "involvedPersons_label_group": false,
      "involvedCorporations_label_group": false,
      "exponats_label_group": false,
      "resources_label_group": false
    },
    matcher: (key, schemaDef, typeName, t, path) => {
      if(key === "dateValue") {
        return dateColDef(key, t, path)
      }
      return null
    }
  },
  "Person": {
    matcher: (key, schemaDef, typeName, t, path) => {
      if(key === "birthDate" || key === "deathDate") {
        return dateColDef(key, t, path)
      }
      return null
    }
  }
}

