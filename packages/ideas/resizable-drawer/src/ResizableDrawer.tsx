import * as React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import MuiDrawer, { DrawerProps } from "@mui/material/Drawer";
import { makeStyles } from "@mui/styles";
import { useCallback, useMemo } from "react";
import { useDrawerDimensions } from "./useDrawerDimensions";

const isHorizontal = (anchor: DrawerProps["anchor"]): boolean =>
  anchor === "right" || anchor === "left" ? false : true;
const openedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));
const useStyles = makeStyles<Theme, DrawerProps>((theme) => ({
  dragger: (props) =>
    isHorizontal(props.anchor)
      ? {
          height: "10px",
          width: "100%",
          backgroundColor: "#f4f7f9",
          cursor: "ns-resize",
          padding: "0 4px 0",
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: theme.zIndex ? theme.zIndex.drawer + 2 : 200,
        }
      : {
          width: "5px",
          backgroundColor: "#f4f7f9",
          cursor: "ew-resize",
          padding: "4px 0 0",
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: theme.zIndex ? theme.zIndex.drawer + 2 : 200,
        },
}));

type MiniDrawerProps = DrawerProps & {};
export const ResizableDrawer = (props: MiniDrawerProps) => {
  const theme = useTheme();
  useStyles(props);

  const [open, setOpen] = React.useState(false);

  const minDrawerWidth = 50;
  const maxDrawerWidth = 1000;

  const [drawerWidth, setDrawerWidth] = React.useState(50);
  const { drawerHeight, setDrawerHeight, minDrawerHeight, maxDrawerHeight } =
    useDrawerDimensions();
  const setTempDrawerHeight = setDrawerHeight;

  //const [drawerHeight, setTempDrawerHeight] = React.useState(globalDrawerHeight);
  const horizontal = useMemo(
    () => (props.anchor === "right" || props.anchor === "left" ? false : true),
    [props.anchor],
  );
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      if (horizontal) {
        //height needs to be calculated from the top of the page
        const newHeight =
          document.body.offsetHeight - e.clientY - document.body.offsetTop - 20;
        if (newHeight > minDrawerHeight && newHeight < maxDrawerHeight) {
          setTempDrawerHeight(newHeight);
        }
      } else {
        const newWidth = e.clientX - document.body.offsetLeft;
        if (newWidth > minDrawerWidth && newWidth < maxDrawerWidth) {
          setDrawerWidth(newWidth);
        }
      }
    },
    [
      horizontal,
      setTempDrawerHeight,
      minDrawerWidth,
      maxDrawerWidth,
      maxDrawerHeight,
      minDrawerHeight,
    ],
  );

  const handleMouseUp = useCallback(() => {
    document.removeEventListener("mouseup", handleMouseUp, true);
    document.removeEventListener("mousemove", handleMouseMove, true);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(() => {
    document.addEventListener("mouseup", handleMouseUp, true);
    document.addEventListener("mousemove", handleMouseMove, true);
  }, [handleMouseMove, handleMouseUp]);

  // https://stackblitz.com/edit/react-2h1g6x?file=ResponsiveDrawer.js
  // React.useEffect(() => {
  //   document.addEventListener("mousemove", (e) => handleMouseMove(e));
  //   document.addEventListener("mouseup", (e) => handleMouseUp(e));
  // }, []);

  const paperStyle = useMemo(() => {
    return horizontal
      ? {
          width: "100%",
          height: drawerHeight,
        }
      : {
          height: "100%",
          width: drawerWidth,
        };
  }, [horizontal, drawerHeight, drawerWidth]);

  return (
    <Drawer
      variant="permanent"
      open={open}
      PaperProps={{ style: paperStyle }}
      {...props}
    >
      <div
        id="dragger"
        onMouseDown={(event) => {
          handleMouseDown();
        }}
        style={
          horizontal
            ? {
                height: "10px",
                width: "100%",
                backgroundColor: "#f4f7f9",
                cursor: "ns-resize",
                padding: "0 4px 0",
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                zIndex: theme.zIndex ? theme.zIndex.drawer + 2 : 200,
              }
            : {
                width: "5px",
                backgroundColor: "#f4f7f9",
                cursor: "ew-resize",
                padding: "4px 0 0",
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                zIndex: theme.zIndex ? theme.zIndex.drawer + 2 : 200,
              }
        }
      />
      <div>{props.children}</div>
    </Drawer>
  );
};
