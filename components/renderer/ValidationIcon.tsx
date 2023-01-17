import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import {
  Badge,
  styled,
  Tooltip} from '@mui/material'
import React from 'react'

const StyledBadge = styled(Badge)(({ theme }: any) => ({
  color: theme.palette.error.main
}))

export interface ValidationProps {
  errorMessages: string;
  id: string;
}

const ValidationIcon: React.FC<ValidationProps> =
  ({ errorMessages, id }) => {
    return (
      <Tooltip
        id={id}
        title={errorMessages}
      >
        <StyledBadge badgeContent={errorMessages.split('\n').length}>
          <ErrorOutlineIcon color='inherit'/>
        </StyledBadge>
      </Tooltip>
    )
}

export default ValidationIcon
