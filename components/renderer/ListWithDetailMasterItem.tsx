import {ControlElement, JsonSchema} from '@jsonforms/core'
import {withJsonFormsContext} from '@jsonforms/react'
import DeleteIcon from '@mui/icons-material/Delete'
import {
    Avatar,
    IconButton,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText
} from '@mui/material'
import React from 'react'

import {withContextToMasterListItemProps} from './withContextToMasterListItem'

export interface OwnPropsOfMasterListItem {
    index: number;
    selected: boolean;
    path: string;
    schema: JsonSchema;
    uischema: ControlElement;
    handleSelect(index: number): () => void;
    removeItem(path: string, value: number): () => void;
}
export interface StatePropsOfMasterItem extends OwnPropsOfMasterListItem {
    childLabel: string;
}

const ListWithDetailMasterItem = ({ index, childLabel, selected, handleSelect, removeItem, path }: StatePropsOfMasterItem) => {

    return (
        <ListItem
            button
            selected={selected}
            onClick={handleSelect(index)}
        >
            <ListItemAvatar>
                <Avatar aria-label='Index'>{index + 1}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={childLabel} style={{overflow: 'hidden', textOverflow: 'ellipsis'}} />
            <ListItemSecondaryAction>
                <IconButton aria-label='Delete' onClick={removeItem(path, index)} size='large'>
                    <DeleteIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    )
}

export default withJsonFormsContext(
  withContextToMasterListItemProps(ListWithDetailMasterItem))
