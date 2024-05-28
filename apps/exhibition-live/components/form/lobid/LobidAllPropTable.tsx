import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Container,
  Link,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";

import { MappingConfigurationDialog } from "../../mapping/MappingConfigurationDialog";
import { gndBaseIRI } from "@slub/edb-ui-utils";
import { EntityChip } from "../show";
import { useQuery } from "@tanstack/react-query";
import { findEntityWithinLobidByIRI } from "@slub/edb-ui-utils";
import WikidataAllPropTable from "../wikidata/WikidataAllPropTable";
import { OverflowContainer } from "../../lists";
import { specialDate2LocalDate } from "@slub/edb-ui-utils";
import { useTranslation } from "next-i18next";
import { isValidUrl } from "@slub/edb-ui-utils";
import { Image } from "mui-image";

export interface AllPropTableProps {
  allProps?: any;
  onEntityChange?: (uri: string) => void;
  disableContextMenu?: boolean;
  inlineEditing?: boolean;
  disabledProperties?: string[];
}

type Props = AllPropTableProps;

const camelCaseToTitleCase = (str: string) => {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase();
  });
};

const LabledLink = ({
  uri,
  label,
  onClick,
}: {
  uri: string;
  label?: string;
  onClick?: () => void;
}) => {
  const urlSuffix = useMemo(
    () =>
      uri.substring(
        (uri.includes("#") ? uri.lastIndexOf("#") : uri.lastIndexOf("/")) + 1 ??
          0,
        uri.length,
      ),
    [uri],
  );
  return onClick && uri.startsWith(gndBaseIRI) ? (
    <Link onClick={onClick} component="button">
      {label || urlSuffix}
    </Link>
  ) : (
    <Link target="_blank" href={uri}>
      {label || urlSuffix}
    </Link>
  );
};

const isImageUrl = (url: string) => {
  return url.match(/\.(jpeg|jpg|gif|png)(\?.*)?$/) != null;
};

const useMenuState = () => {
  const [menuAnchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return {
    menuAnchorEl,
    menuOpen,
    handleMenuClick,
    handleMenuClose,
  };
};

const PropertyContextMenu = ({
  onClose,
  property,
}: {
  onClose?: () => void;
  property: string;
}) => {
  const [mappingModalOpen, setMappingModalOpen] = useState<boolean>(false);
  const handleCreateMapping = useCallback(() => {
    setMappingModalOpen(true);
  }, [setMappingModalOpen]);

  const handleMappingModalClose = useCallback(() => {
    setMappingModalOpen(false);
    onClose && onClose();
  }, [setMappingModalOpen, onClose]);

  return (
    <>
      <MappingConfigurationDialog
        mapping={{ source: { path: property } }}
        open={mappingModalOpen}
        onClose={handleMappingModalClose}
      />
      <MenuList dense>
        <MenuItem onClick={handleCreateMapping}>create Mapping</MenuItem>
        <MenuItem onClick={onClose}>Property info</MenuItem>
      </MenuList>
    </>
  );
};

const PropertyItem = ({
  property,
  value: originalValue,
  onEntityChange,
  disableContextMenu,
}: {
  property: string;
  value: any;
  onEntityChange?: (uri: string) => void;
  disableContextMenu?: boolean;
}) => {
  const { menuAnchorEl, menuOpen, handleMenuClick, handleMenuClose } =
    useMenuState();
  const value = useMemo(() => {
    return typeof originalValue === "object" && !Array.isArray(originalValue)
      ? [originalValue]
      : originalValue;
  }, [originalValue]);
  const {
    t,
    i18n: { language: locale, exists },
  } = useTranslation("table");
  return (
    <TableRow>
      <TableCell
        style={{ width: "20%", overflow: "hidden", textOverflow: "ellipsis" }}
        component="th"
        scope="row"
      >
        {disableContextMenu ? (
          <OverflowContainer variant="body2">
            {typeof exists === "function" && exists(property, { ns: "table" })
              ? t(property)
              : camelCaseToTitleCase(property)}
          </OverflowContainer>
        ) : (
          <>
            <Button
              id={"menu-button-" + property}
              sx={{
                textAlign: "left",
                textTransform: "none",
              }}
              size={"small"}
              variant={"text"}
              aria-label={"mapping"}
              onClick={handleMenuClick}
            >
              {typeof exists === "function" && exists(property)
                ? t(property)
                : camelCaseToTitleCase(property)}
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={menuAnchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              MenuListProps={{
                "aria-labelledby": "menu-button" + property,
              }}
            >
              <PropertyContextMenu
                onClose={handleMenuClose}
                property={property}
              />
            </Menu>
          </>
        )}
      </TableCell>
      <TableCell
        sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
        align="right"
      >
        {Array.isArray(value) ? (
          <Stack
            spacing={1}
            direction="row"
            flexWrap={"wrap"}
            justifyContent={"end"}
          >
            {value.map((v, index) => {
              const comma = index < value.length - 1 ? "," : "";
              if (typeof v === "string") {
                return (
                  <span key={v}>
                    {v}
                    {comma}{" "}
                  </span>
                );
              }
              if (typeof v.id === "string") {
                return (
                  <span key={v.id}>
                    <LabledLink
                      uri={v.id}
                      label={v.label}
                      onClick={
                        onEntityChange ? () => onEntityChange(v.id) : undefined
                      }
                    />
                    {comma}{" "}
                  </span>
                );
              }
              if (typeof v === "object" && v["@id"] && v["@type"]) {
                return (
                  <EntityChip
                    key={v["@id"]}
                    index={index}
                    data={v}
                    entityIRI={v["@id"]}
                    typeIRI={v["@type"]}
                  />
                );
              }
            })}
          </Stack>
        ) : typeof value === "string" || typeof value === "number" ? (
          property.toLowerCase().includes("date") ? (
            specialDate2LocalDate(value as number, locale)
          ) : isValidUrl(value as string) ? (
            isImageUrl(value as string) ? (
              <Box sx={{ display: "flex", justifyContent: "end" }}>
                <Link href={value as string} target="_blank">
                  <Image
                    src={value as string}
                    alt={value as string}
                    width={100}
                  />
                </Link>
              </Box>
            ) : (
              <LabledLink uri={value as string} />
            )
          ) : (
            value.toLocaleString()
          )
        ) : typeof value === "boolean" ? (
          <Checkbox checked={value} disabled={true} />
        ) : (
          t("unknown")
        )}
      </TableCell>
    </TableRow>
  );
};
const LobidAllPropTable: FunctionComponent<Props> = ({
  allProps,
  disableContextMenu,
  inlineEditing,
  disabledProperties,
}) => {
  const gndIRI = useMemo(() => {
    const gndIRI_ = allProps?.idAuthority?.["@id"] || allProps?.idAuthority;
    if (typeof gndIRI_ !== "string") return undefined;
    return gndIRI_.startsWith(gndBaseIRI) ? gndIRI_ : undefined;
  }, [allProps]);
  const { data: rawEntry } = useQuery(
    ["lobid", gndIRI],
    () => findEntityWithinLobidByIRI(gndIRI),
    { enabled: !!gndIRI },
  );

  return (
    <>
      <TableContainer component={Container}>
        <Table
          sx={{ minWidth: "100%", tableLayout: "fixed" }}
          aria-label="custom detail table"
        >
          <TableBody>
            {allProps &&
              Object.entries(allProps)
                .filter(
                  ([key, value]) =>
                    disabledProperties?.includes(key) !== true &&
                    !key.startsWith("@") &&
                    (typeof value === "string" ||
                      typeof value === "number" ||
                      typeof value === "boolean" ||
                      (typeof value === "object" &&
                        value["@id"] &&
                        value["@type"]) ||
                      (Array.isArray(value) && value.length > 0)),
                )
                .map(([key, value]) => (
                  <PropertyItem
                    key={key}
                    property={key}
                    value={value}
                    disableContextMenu={disableContextMenu}
                  />
                ))}
          </TableBody>
        </Table>
      </TableContainer>
      {rawEntry && (
        <>
          <Accordion>
            <AccordionSummary>
              <Typography>GND Eintrag</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <LobidAllPropTable allProps={rawEntry} disableContextMenu />
            </AccordionDetails>
          </Accordion>
          {(rawEntry.sameAs || [])
            .filter(({ id }) =>
              id.startsWith("http://www.wikidata.org/entity/"),
            )
            .map(({ id }) => (
              <Accordion key={id}>
                <AccordionSummary>
                  <Typography>Wikidata Einträge</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <WikidataAllPropTable key={id} thingIRI={id} />
                </AccordionDetails>
              </Accordion>
            ))}
        </>
      )}
    </>
  );
};

export default LobidAllPropTable;
