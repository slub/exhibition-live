// @flow
import {
  Avatar,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemButtonProps,
  ListItemText,
  Typography,
} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import * as React from "react";
import {FunctionComponent, useCallback, useEffect, useState} from "react";
import {ClassicResultPopperItem} from "./ClassicResultPopperItem";
import {useSimilarityFinderState} from "../../state";

type OwnProps = {
  id: string;
  index: number;
  onSelected: (id: string) => void;
  avatar?: string;
  label: string;
  secondary?: string;
  altAvatar?: string;
  popperChildren?: React.ReactNode;
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
                                                           ...rest
                                                         }) => {
  const theme = useTheme();
  const anchorRef = React.useRef<HTMLDivElement | null>(null);
  const popperRef = React.useRef<HTMLDivElement | null>(null);

  const handleSelect = useCallback(() => {
    onSelected(id);
  }, [onSelected, id]);

  const {cycleThroughElements, setElementIndex, resetElementIndex} = useSimilarityFinderState()
  const [hasFocus, setHasFocus] = useState(false)
  const handleFocus = useCallback(() => {
    setHasFocus(true)
    if(!selected) setElementIndex(index)
  }, [setHasFocus, setElementIndex, selected, index])

  const handleBlur = useCallback(() => {
    setHasFocus(false)
    if(selected) resetElementIndex()
  }, [setHasFocus, resetElementIndex, selected])

  useEffect(() => {
    if (selected) {
      anchorRef.current?.focus()
    }
  }, [selected]);



  const handleKeyUpDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      e.stopPropagation()
      if (e.key === "ArrowDown") {
        cycleThroughElements(1)
      } else {
        cycleThroughElements(-1)
      }
    }
    if (e.key === "Enter") {
      handleSelect()
    }
  }, [cycleThroughElements, handleSelect])

  return (
    <>
      <ListItem sx={{p: 0}} alignItems="flex-start">
        <ListItemButton
          onClick={handleSelect}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyUp={handleKeyUpDown}
          ref={anchorRef}
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
              <Typography variant="h5" color="inherit">
                {label}
              </Typography>
            }
            secondary={
              <Typography
                variant="caption"
                sx={{...theme.typography.caption}}
              >
                {secondary}
              </Typography>
            }
          />
        </ListItemButton>
      </ListItem>
      <ClassicResultPopperItem
        sx={{zIndex: 2000}}
        anchorEl={anchorRef.current}
        popperRef={popperRef as any}
        open={hasFocus || selected}>
        {popperChildren}
      </ClassicResultPopperItem>
      <Divider variant="inset" component="li"/>
    </>
  );
};

export default ClassicResultListItem;
