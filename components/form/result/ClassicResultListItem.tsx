// @flow
import {Avatar, Divider, ListItem, ListItemAvatar, ListItemButton, ListItemText} from '@mui/material'
import * as React from 'react'
import {FunctionComponent, useCallback} from 'react'

type Props = {

  id: string,
  onSelected: (id: string) => void,
  avatar?: string,
  label: string,
  secondary?: string,
  altAvatar?: string
};

const ClassicResultListItem: FunctionComponent<Props> = ({
    id,
    onSelected,
    avatar,
    label,
    secondary,
    altAvatar
}) => {

  const handleSelect = useCallback(
      () => {
        onSelected(id)
      }, [onSelected, id])

  return (
      <>
        <ListItem alignItems='flex-start'>
          <ListItemButton onClick={handleSelect}>
            <ListItemAvatar>
              <Avatar aria-label='Photo' src={avatar}>{!avatar ? altAvatar : ''}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={label}
                          secondary={secondary}/>
          </ListItemButton>
        </ListItem>
        <Divider variant="inset" component="li"/>
      </>
  )


}

export default ClassicResultListItem