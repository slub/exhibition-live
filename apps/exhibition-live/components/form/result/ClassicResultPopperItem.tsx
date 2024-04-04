import {
  Box,
  IconButton,
  Paper,
  Popper as MuiPopper,
  PopperProps,
  styled,
} from "@mui/material";
import { FunctionComponent } from "react";
import * as React from "react";
import { Close } from "@mui/icons-material";

const Arrow = styled("div")({
  position: "absolute",
  fontSize: 16,
  width: "3em",
  height: "3em",
  right: "1em !important",
  "&::before": {
    content: '""',
    margin: "auto",
    display: "block",
    width: 0,
    height: 0,
    borderStyle: "solid",
  },
});

const Popper = styled(MuiPopper, {
  shouldForwardProp: (prop) => prop !== "arrow",
})(({ theme }) => {
  const arrow = true;
  return {
    zIndex: 1,
    "& > div": {
      position: "relative",
    },
    '&[data-popper-placement*="bottom"]': {
      "& > div": {
        marginTop: arrow ? 2 : 0,
      },
      "& .MuiPopper-arrow": {
        top: 0,
        left: 0,
        marginTop: "-0.9em",
        width: "3em",
        height: "1em",
        "&::before": {
          borderWidth: "0 1em 1em 1em",
          borderColor: `transparent transparent ${theme.palette.background.paper} transparent`,
        },
      },
    },
    '&[data-popper-placement*="top"]': {
      "& > div": {
        marginBottom: arrow ? 2 : 0,
      },
      "& .MuiPopper-arrow": {
        bottom: 0,
        left: 0,
        marginBottom: "-0.9em",
        width: "3em",
        height: "1em",
        "&::before": {
          borderWidth: "1em 1em 0 1em",
          borderColor: `${theme.palette.background.paper} transparent transparent transparent`,
        },
      },
    },
    '&[data-popper-placement*="right"]': {
      "& > div": {
        marginLeft: arrow ? 2 : 0,
      },
      "& .MuiPopper-arrow": {
        left: 0,
        marginLeft: "-0.9em",
        height: "3em",
        width: "1em",
        "&::before": {
          borderWidth: "1em 1em 1em 0",
          borderColor: `transparent ${theme.palette.background.paper} transparent transparent`,
        },
      },
    },
    '&[data-popper-placement*="left"]': {
      "& > div": {
        marginRight: arrow ? 2 : 0,
      },
      "& .MuiPopper-arrow": {
        right: 0,
        marginRight: "-0.9em",
        height: "3em",
        width: "1em",
        "&::before": {
          borderWidth: "1em 0 1em 1em",
          borderColor: `transparent transparent transparent ${theme.palette.background.paper}`,
        },
      },
    },
  };
});

export const ClassicResultPopperItem: FunctionComponent<
  {
    children: React.ReactNode;
    onClose?: () => void;
    popperRef?: React.MutableRefObject<HTMLDivElement | null>;
  } & PopperProps
> = ({ children, popperRef, onClose, ...rest }) => {
  const [arrowRef, setArrowRef] = React.useState<HTMLElement>(null);

  return (
    <Box sx={{ position: "relative" }}>
      <Popper
        {...rest}
        placement="left"
        disablePortal={false}
        modifiers={[
          {
            name: "flip",
            enabled: true,
            options: {
              altBoundary: true,
              rootBoundary: "document",
              padding: 8,
            },
          },
          {
            name: "arrow",
            enabled: true,
            options: {
              element: arrowRef,
            },
          },
        ]}
      >
        <Box ref={popperRef}>
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 5,
              right: 15,
            }}
          >
            <Close />
          </IconButton>
          <Arrow ref={setArrowRef} className="MuiPopper-arrow" />
          <Paper sx={{ p: 2, m: 2, paddingTop: 4 }} elevation={2}>
            {children}
          </Paper>
        </Box>
      </Popper>
    </Box>
  );
};
