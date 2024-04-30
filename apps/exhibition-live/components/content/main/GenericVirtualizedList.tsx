import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { Components, ScrollerProps, Virtuoso } from "react-virtuoso";
import { withEllipsis } from "@slub/edb-ui-utils";
import React, {
  ComponentType,
  CSSProperties,
  forwardRef,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import PerfectScrollbar from "perfect-scrollbar";

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

type GenericMaterialListItemProps = GenericListItem & {
  index: number;
  onClick?: (entry: GenericListItem) => void;
};

export const GenericMaterialListItem = ({
  index,
  onClick,
  ...item
}: GenericMaterialListItemProps) => {
  const { primary, secondary, description, avatar } = item;
  return (
    <ListItemButton onClick={() => onClick && onClick(item)}>
      <ListItemAvatar>
        <Avatar variant={"rounded"} aria-label="Index" src={avatar}>
          {index + 1}
        </Avatar>
      </ListItemAvatar>
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
  onItemSelect?: (entityIRI: string) => void;
};

export const GenericVirtualizedList = ({
  items,
  width,
  height,
  onItemSelect,
}: GenericVirtualizedListProps) => (
  <Virtuoso
    height={height}
    width={width}
    totalCount={items.length}
    components={MUIComponents as Components<GenericListItem>}
    itemContent={(index) => (
      <GenericMaterialListItem
        index={index}
        onClick={(item: GenericListItem) =>
          onItemSelect && onItemSelect(item.id)
        }
        {...items[index]}
      />
    )}
  />
);
