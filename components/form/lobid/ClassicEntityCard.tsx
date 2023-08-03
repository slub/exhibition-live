import { ArrowBack } from '@mui/icons-material'
import {Button, Card, CardActions, CardContent, CardMedia, IconButton, Typography} from '@mui/material'
import {FunctionComponent, useCallback, useState} from 'react'

import LobidAllPropTable from './LobidAllPropTable'

type Props = {
  data: Partial<{
    id: string,
    label: string,
    title: string,
    name: string,
    description: string,
    avatar: string
    allProps: any
  }>,
  id: string,
  onBack?: () => void,
  onAcceptItem?: (id: string | undefined) => void
  onSelectItem?: (id: string | undefined) => void
}

const ClassicEntityCard: FunctionComponent<Props> = ({
  data, id, onBack, onSelectItem, onAcceptItem
}) => {
  const [expanded, setExpanded] = useState(true)
  const _label = data.label || data.title || data.name || id

  const handleExpandClick = useCallback(
      () => {
        setExpanded(expanded => !expanded)
      }, [setExpanded])

  const handleEntityChange = useCallback(
      (uri: string) => {
        onSelectItem && onSelectItem(uri)
      },
      [onAcceptItem])

  return (<>
    {onBack && <IconButton onClick={onBack}><ArrowBack /></IconButton>}
        <Card >
          {data.avatar && <CardMedia
              component="img"
              alt={'Image of ' + _label}
              height="300"
              image={data.avatar}
          />}
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {_label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.description}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" onClick={() => onAcceptItem && onAcceptItem(data?.id)}>Eintrag übernehmen</Button>
            <Button size="small" onClick={handleExpandClick}>Details zeigen</Button>
          </CardActions>
        </Card>
        {expanded &&  <LobidAllPropTable allProps={data.allProps} onEntityChange={handleEntityChange}  /> }
      </>
  )
}
export default ClassicEntityCard