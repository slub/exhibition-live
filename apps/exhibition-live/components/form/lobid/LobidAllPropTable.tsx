import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import {
  Button,
  Container,
  IconButton,
  Link,
  Menu,
  MenuItem,
  MenuList,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";

import { MappingConfigurationDialog } from "../../mapping/MappingConfigurationDialog";
import { gndBaseIRI } from "../../utils/gnd/prefixes";

interface OwnProps {
  allProps?: any;
  onEntityChange?: (uri: string) => void;
}

type Props = OwnProps;

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
  return uri.startsWith(gndBaseIRI) ? (
    <Link onClick={onClick} component="button">
      {label || urlSuffix}
    </Link>
  ) : (
    <Link target="_blank" href={uri}>
      {label || urlSuffix}
    </Link>
  );
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
  }, [onClose, setMappingModalOpen]);

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
  value,
  onEntityChange,
}: {
  property: string;
  value: any;
  onEntityChange?: (uri: string) => void;
}) => {
  const { menuAnchorEl, menuOpen, handleMenuClick, handleMenuClose } =
    useMenuState();
  return (
    <TableRow>
      <TableCell style={{ width: 100 }} component="th" scope="row">
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
          startIcon={<MoreVertIcon />}
        >
          {camelCaseToTitleCase(property)}
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
          <PropertyContextMenu onClose={handleMenuClose} property={property} />
        </Menu>
      </TableCell>
      <TableCell align="right">
        {(Array.isArray(value) &&
          value.map((v, index) => {
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
                    onClick={() => onEntityChange && onEntityChange(v.id)}
                  />
                  {comma}{" "}
                </span>
              );
            }
          })) ||
          typeof value === "string" ||
          typeof value === "number" ||
          (typeof value === "boolean" && value)}
      </TableCell>
    </TableRow>
  );
};
const LobidAllPropTable: FunctionComponent<Props> = ({
  allProps,
  onEntityChange,
}) => {
  const handleClickEntry = useCallback(
    (id: string) => {
      onEntityChange && onEntityChange(id);
    },
    [onEntityChange],
  );

  return (
    <TableContainer component={Container}>
      <Table sx={{ minWidth: "100%" }} aria-label="custom table">
        <TableBody>
          {allProps &&
            Object.entries(allProps)
              .filter(
                ([key, value]) =>
                  !key.startsWith("@") &&
                  (typeof value === "string" ||
                    (Array.isArray(value) && value.length > 0)),
              )
              .map(([key, value]) => (
                <PropertyItem
                  key={key}
                  property={key}
                  value={value}
                  onEntityChange={handleClickEntry}
                />
              ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LobidAllPropTable;
