// @flow
import {
    Avatar,
    Divider,
    IconButton,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemButtonProps, ListItemProps,
    ListItemText, Stack,
    Typography,
} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import * as React from "react";
import {FunctionComponent, useCallback, useEffect, useState} from "react";
import {ClassicResultPopperItem} from "./ClassicResultPopperItem";
import {useKeyEventForSimilarityFinder, useSimilarityFinderState} from "../../state";
import {Check} from "@mui/icons-material";
import {OverflowContainer} from "../../lists";

type OwnProps = {
  id: string;
  index: number;
  onSelected: (id: string, index: number) => void;
  avatar?: string;
  label: string;
  secondary?: string;
  altAvatar?: string;
  popperChildren?: React.ReactNode;
  listItemProps?: Partial<ListItemProps>;
  onEnter?: () => void
};

type Props = OwnProps & ListItemButtonProps;

const ClassicResultListItem: FunctionComponent<Props> = ({
                                                           id,
                                                           index,
                                                           onSelected,
                                                           avatar,
                                                           label,
                                                           secondary,
                                                           altAvatar,
                                                           selected,
                                                           popperChildren,
                                                           listItemProps = {},
                                                           onEnter,
                                                           ...rest
                                                         }) => {
  const theme = useTheme();
  const anchorRef = React.useRef<HTMLLIElement | null>(null);
  const buttonRef = React.useRef<HTMLDivElement | null>(null);
  const popperRef = React.useRef<HTMLDivElement | null>(null);

  const [closed, setClosed] = useState(false);
  const handleSelect = useCallback(() => {
    setClosed(false);
    onSelected(id, index);
  }, [onSelected, id, index, setClosed]);

  const { setElementIndex } = useSimilarityFinderState()
  const handleFocus = useCallback(() => {
    if(!selected) setElementIndex(index)
  }, [ setElementIndex, selected, index])

  const handleEnter = useCallback(() => {
      if(onEnter) {
          setClosed(true)
          onEnter()
      }
  }, [onEnter, setClosed]);

  useEffect(() => {
    if (selected) {
      anchorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center"
      })
      buttonRef.current?.focus({
          preventScroll: true
      })

    }
  }, [selected]);

  const handleKeyUpDown = useKeyEventForSimilarityFinder(handleEnter)



  return (
      <ListItem
          sx={{p: 0}}
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
              sx={{width: "32px", height: "32px"}}
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
                sx={{...theme.typography.caption}}
              >
                {secondary}
              </OverflowContainer>
            }
          />
        </ListItemButton>
        <ClassicResultPopperItem
              sx={{zIndex: 10000}}
              anchorEl={anchorRef.current}
              popperRef={popperRef as any}
              onClose={() => setClosed(true)}
              open={selected && !closed}>
              {popperChildren}
          </ClassicResultPopperItem>
      </ListItem>
  );
};

export default ClassicResultListItem;
