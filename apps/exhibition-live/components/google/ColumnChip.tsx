import { useTranslation } from "next-i18next";
import React, { useCallback, useMemo } from "react";
import {
  DeclarativeFlatMapping,
  DeclarativeFlatMappings,
  DeclarativeMatchBasedFlatMapping,
  DeclarativeMatchBasedFlatMappings,
} from "@slub/edb-ui-utils";
import NiceModal from "@ebay/nice-modal-react";
import { SpreadSheetTable } from "./SpreadSheetTable";
import { Chip, Divider, Menu, MenuItem } from "@mui/material";
import { OwnColumnDesc } from "./types";
import { CachedWorkSheet, CellTypeLike } from "./useCachedWorkSheet";
import { NiceMappingConfigurationDialog } from "./NiceMappingConfigurationDialog";

export type ColumnChipProps<CellType extends CellTypeLike> = {
  columnIndex: number;
  columnLetter: string;
  columnDesc: OwnColumnDesc[];
  value: any;
  label: string;
  spreadSheetMapping?: DeclarativeFlatMappings;
  rawMapping?: DeclarativeMatchBasedFlatMappings;
  workSheet: CachedWorkSheet<CellType>;
};
export const ColumnChip = <CellType extends CellTypeLike>({
  label,
  columnIndex,
  columnLetter,
  columnDesc,
  spreadSheetMapping,
  rawMapping,
  workSheet,
}: ColumnChipProps<CellType>) => {
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const columnMapping = useMemo(
    () =>
      spreadSheetMapping?.filter((mapping) =>
        Boolean(
          (mapping.source.columns as any)?.find((col) =>
            typeof col === "string"
              ? col === columnLetter
              : col === columnIndex,
          ),
        ),
      ) || [],
    [spreadSheetMapping, columnIndex, columnLetter],
  );
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAssignMapping = useCallback(() => {}, []);
  const handleOpenMapping = useCallback(
    (
      mappingDecl: DeclarativeFlatMapping,
      rawMapping?: DeclarativeMatchBasedFlatMapping,
    ) => {
      NiceModal.show(NiceMappingConfigurationDialog, {
        mapping: mappingDecl,
        rawMapping,
        sourcePath: columnIndex,
        fields: columnDesc,
        tablePreview: (mapping: DeclarativeFlatMapping) => {
          return (
            <SpreadSheetTable
              workSheet={workSheet}
              columnIndicies={mapping.source.columns as number[]}
            />
          );
        },
      });
    },
    [columnIndex, workSheet, columnDesc],
  );

  return (
    <>
      <Chip
        label={label}
        color={columnMapping.length > 0 ? "primary" : undefined}
        sx={{ margin: "0.2rem" }}
        onClick={handleClick}
      />
      <Menu
        id="lock-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "lock-button",
          role: "listbox",
        }}
      >
        <MenuItem key={"option1"} onClick={handleAssignMapping}>
          {t("assign mapping")}
        </MenuItem>
        <Divider />
        {columnMapping.map((mapping, index) => {
          const raw = rawMapping?.find(
            (rawMappingDecl) => rawMappingDecl.id === mapping.id,
          );
          return (
            <MenuItem
              key={index}
              onClick={() => handleOpenMapping(mapping, raw)}
            >
              {t("open Mapping", { index: index + 1 })}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
