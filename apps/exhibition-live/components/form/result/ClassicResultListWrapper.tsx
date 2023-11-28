import {
  Box,
  Divider,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { FunctionComponent, useCallback, useState } from "react";

type Props = {
  label?: string;
  selected?: boolean;
  children?: React.ReactNode;
};

const ClassicResultListWrapper: FunctionComponent<Props> = ({
  label,
  selected,
  children,
}) => {
  const [open, setOpen] = useState<boolean>(true);

  const toggleOpen = useCallback(() => {
    setOpen(!open);
  }, [setOpen, open]);


  return (
    <Box>
      <ListItemButton
        alignItems="flex-start"
        onClick={toggleOpen}
      >
        <ListItemText
          primary={label}
          primaryTypographyProps={{
            fontSize: 15,
            fontWeight: 'medium',
            lineHeight: '20px',
            mb: '2px',
          }}
          secondary={selected ? "Suche liefert folgende Treffer" : "Keine Suche"}
          secondaryTypographyProps={{
            noWrap: true,
            fontSize: 12,
            lineHeight: '16px',
          }}
          sx={{ my: 0 }}
        />
          <KeyboardArrowDown
            sx={{
              mr: -1,
              transform: open ? 'rotate(-180deg)' : 'rotate(0)',
              transitiotn: '0.2s',
            }}
          />
      </ListItemButton>
      <Divider />
      { selected && open && children}
    </Box>
  );
};

export default ClassicResultListWrapper;
