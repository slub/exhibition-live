import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemButtonProps,
  ListItemProps,
  ListItemText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import * as React from "react";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import {
  useKeyEventForSimilarityFinder,
  useSimilarityFinderState,
} from "@slub/edb-state-hooks";
import { OverflowChip, OverflowContainer } from "../overflow";
import { ClassicResultPopperItem } from "../entity";

type OwnProps = {
  id: string;
  index: number;
  onSelected: (id: string, index: number) => void;
  avatar?: string;
  label: string;
  secondary?: string;
  category?: string;
  altAvatar?: string;
  popperChildren?: React.ReactNode;
  listItemProps?: Partial<ListItemProps>;
  onEnter?: () => void;
  onClose?: () => void;
  popperClosed?: boolean;
};

export type ClassicResultListItemProps = OwnProps & ListItemButtonProps;

export const ClassicResultListItem: FunctionComponent<
  ClassicResultListItemProps
> = ({
  id,
  index,
  onSelected,
  avatar,
  label,
  secondary,
  category,
  altAvatar,
  selected,
  popperChildren,
  listItemProps = {},
  onEnter,
  popperClosed,
  onClose,
  ...rest
}) => {
  const theme = useTheme();
  const anchorRef = React.useRef<HTMLLIElement | null>(null);
  const buttonRef = React.useRef<HTMLDivElement | null>(null);
  const popperRef = React.useRef<HTMLDivElement | null>(null);

  const [closed, setClosed] = useState(false);
  const handleSelect = useCallback(() => {
    onSelected(id, index);
  }, [onSelected, id, index]);

  const { setElementIndex } = useSimilarityFinderState();
  const handleFocus = useCallback(() => {
    if (!selected) setElementIndex(index);
  }, [setElementIndex, selected, index]);

  const handleEnter = useCallback(() => {
    if (onEnter) {
      onEnter();
    }
  }, [onEnter]);

  useEffect(() => {
    if (selected) {
      anchorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setClosed(false);
    }
  }, [selected, setClosed]);

  const handleKeyUpDown = useKeyEventForSimilarityFinder(handleEnter);

  return (
    <ListItem
      sx={{ p: 0 }}
      alignItems="flex-start"
      ref={anchorRef}
      {...listItemProps}
    >
      <ListItemButton
        onClick={handleSelect}
        onFocus={handleFocus}
        onKeyUp={handleKeyUpDown}
        selected={selected}
        ref={buttonRef}
        {...rest}
      >
        <ListItemAvatar>
          <Avatar
            sx={{ width: "32px", height: "32px" }}
            aria-label="Photo"
            src={avatar}
          >
            {!avatar ? altAvatar : ""}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <OverflowContainer variant="h5" color="inherit">
              {label}
            </OverflowContainer>
          }
          secondary={
            <OverflowContainer
              variant="caption"
              useParentTarget
              sx={{ ...theme.typography.caption }}
            >
              {category && <OverflowChip label={category} />}
              {secondary}
            </OverflowContainer>
          }
        />
      </ListItemButton>
      <ClassicResultPopperItem
        sx={{ zIndex: 10000 }}
        anchorEl={anchorRef.current}
        popperRef={popperRef as any}
        onClose={() => setClosed(true)}
        open={selected && !closed}
      >
        {popperChildren}
      </ClassicResultPopperItem>
    </ListItem>
  );
};
