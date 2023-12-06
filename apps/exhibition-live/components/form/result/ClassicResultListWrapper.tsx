import { Divider, ListItemButton, ListItemText, Paper, Grid } from "@mui/material";
import { FunctionComponent, useCallback, useState } from "react";

type Props = {
  label?: string;
  selected?: boolean;
  children?: React.ReactNode;
  handleClick?: (id: undefined) => void;
};

const ClassicResultListWrapper: FunctionComponent<Props> = ({
  label,
  selected,
  children,
  handleClick,
}) => {

  return (
    <Paper sx={selected ? { width: '100%', flex: 2 } : { width: '100%' }}>
      <Grid container sx={{ width: '100%', display: 'block'}}>
        <Grid item sx={{ width: '100%'}}>
        <ListItemButton sx={{ width: '100%', flexGrow: 0 }} alignItems="flex-start" onClick={handleClick}>
        <ListItemText
          primary={label}
          primaryTypographyProps={{
            fontSize: 15,
            fontWeight: "medium",
            lineHeight: "20px",
            mb: "2px",
          }}
          secondary={
            selected ? "Suche liefert folgende Treffer" : "Keine Suche"
          }
          secondaryTypographyProps={{
            noWrap: true,
            fontSize: 12,
            lineHeight: "16px",
          }}
          sx={{ my: 0 }}
        />
      </ListItemButton>
        </Grid>
        <Divider />
        <Grid item>
          {selected && (
            <>
              <Paper sx={{ maxHeight: '100%', display: 'block', flexGrow: 1, overflow: 'auto' }}>
                {children}
              </Paper>
              <Divider />
            </>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ClassicResultListWrapper;
