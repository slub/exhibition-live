import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { Components, ScrollerProps, Virtuoso } from "react-virtuoso";
import { withEllipsis } from "../../utils/typography";
import {
  ComponentType,
  CSSProperties,
  forwardRef,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import PerfectScrollbar from "perfect-scrollbar";
import { Img } from "../../utils/image/Img";

const Scroller: ComponentType<ScrollerProps> = forwardRef<HTMLDivElement, any>(
  ({ children, style, ...props }, ref) => {
    const ps = useRef(null);

    useEffect(() => {
      if (!ref) return;
      ps.current = new PerfectScrollbar((ref as any).current, {
        minScrollbarLength: 25,
      });
      return () => {
        ps.current.destroy();
      };
    }, [ref]);

    return (
      <div style={{ ...style }} ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

export type GenericListItem = {
  entry?: any;
  id: string;
  primary: string;
  secondary?: string;
  description?: string;
  avatar?: string;
};

type GenericListItemProps = GenericListItem & {
  index: number;
  onClick?: (entry: any) => void;
};

export const GenericListItem = ({
  index,
  primary,
  secondary,
  description,
  avatar,
  onClick,
}: GenericListItemProps) => {
  return (
    <>
      <ListItemIcon>
        <Img alt={primary} width={48} height={48} src={avatar}></Img>
      </ListItemIcon>
      {onClick ? (
        <ListItemButton onClick={onClick}>
          <ListItemText
            primary={primary}
            secondary={
              <>
                <Typography
                  sx={{ display: "inline" }}
                  component="span"
                  variant="body2"
                  color="text.primary"
                >
                  {withEllipsis(secondary, 50)}
                </Typography>
                {withEllipsis(description, 100)}
              </>
            }
          />
        </ListItemButton>
      ) : (
        <ListItemText
          primary={primary}
          secondary={
            <>
              <Typography
                sx={{ display: "inline" }}
                component="span"
                variant="body2"
                color="text.primary"
              >
                {withEllipsis(secondary, 50)}
              </Typography>
              {withEllipsis(description, 100)}
            </>
          }
        />
      )}
    </>
  );
};

const MUIComponents = {
  List: forwardRef<any, { style?: CSSProperties; children?: ReactNode }>(
    ({ style, children }, listRef) => {
      return (
        <List style={style} component="div" ref={listRef}>
          {children}
        </List>
      );
    },
  ),

  Item: ({ children, ...props }) => {
    return (
      <ListItem {...props} style={{ margin: 0 }} alignItems="flex-start">
        {children}
      </ListItem>
    );
  },
};

type GenericVirtualizedListProps = {
  items: GenericListItem[];
  width: number;
  height: number;
};

export const GenericVirtualizedList = ({
  items,
  width,
  height,
}: GenericVirtualizedListProps) => (
  <Virtuoso
    height={height}
    width={width}
    totalCount={items.length}
    components={MUIComponents as Components<GenericListItem>}
    itemContent={(index) => <GenericListItem index={index} {...items[index]} />}
  />
);
