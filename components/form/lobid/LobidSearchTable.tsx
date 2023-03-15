import {Avatar, Divider, List, ListItem, ListItemAvatar, ListItemButton, ListItemText} from '@mui/material'
import {Fragment, FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react'

import findEntityWithinLobid from '../../utils/lobid/findEntityWithinLobid'
import ClassicResultListItem from '../result/ClassicResultListItem'
import ClassicEntityCard from './ClassicEntityCard'

type Props = {
  searchString: string,
  typeName?: string
  onSelect?: (id: string | undefined) => void,
  onAcceptItem?: (id: string | undefined, data: any) => void
}

const LobidSearchTable: FunctionComponent<Props> = ({
                                                      searchString,
                                                      typeName = 'Person',
                                                      onSelect,
                                                      onAcceptItem
                                                    }
) => {
  const [resultTable, setResultTable] = useState()
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [selectedEntry, setSelectedEntry] = useState<any | undefined>()

  const fetchData = useCallback(
      async () => {
        if (!searchString || searchString.length < 1) return
        setResultTable(
            (await findEntityWithinLobid(searchString, typeName, 10))?.member?.map(
                (allProps: any) => {
                  const {
                    id,
                    preferredName = '',
                    depiction,
                    professionOrOccupation = []
                  } = allProps
                  const dateOfBirth = allProps?.dateOfBirth?.[0],
                      dateOfDeath = allProps?.dateOfDeath?.[0],
                      dateOfBirthAndDeath = allProps?.dateOfBirthAndDeath?.[0],
                      profession = professionOrOccupation.map(({label}: {label: any}) => label).join(',')
                  return ({
                    id,
                    label: preferredName,
                    secondary: dateOfBirthAndDeath ? dateOfBirthAndDeath : (dateOfBirth || dateOfDeath ? `${dateOfBirth || ''} | ${dateOfDeath || ''} | ${profession}` : null),
                    dateOfBirth,
                    dateOfDeath,
                    dateOfBirthAndDeath,
                    avatar: depiction?.[0]?.thumbnail,
                    allProps
                  })
                }))
      },
      [searchString, typeName],
  )

  const handleSelect = useCallback(
      (id: string | undefined) => {
        setSelectedId(id)
        // @ts-ignore
        setSelectedEntry(id && resultTable?.find((entry) => entry.id === id))
        onSelect && onSelect(id)
      }, [setSelectedId, resultTable, setSelectedEntry, onSelect])


  useEffect(() => {
    fetchData()
  }, [searchString, typeName, fetchData])

  const handleAccept = useCallback(
      (id: string | undefined) => {
        onAcceptItem && onAcceptItem(id, selectedEntry)
      }, [onAcceptItem, selectedEntry])

  return (!selectedId ? <List>
    {
      // @ts-ignore
      resultTable?.map(({id, label, dateOfBirthAndDeath, dateOfBirth, dateOfDeath, avatar, secondary}, idx) => {
        return (
            <ClassicResultListItem
                key={id}
                id={id}
                onSelected={handleSelect}
                label={label}
                secondary={secondary}
                avatar={avatar}
                altAvatar={idx + 1}/>
        )
      })
    }

  </List> : <ClassicEntityCard
      id={selectedId}
      data={selectedEntry}
      onBack={() => handleSelect(undefined)}
      onAcceptItem={handleAccept}/>)

}


export default LobidSearchTable