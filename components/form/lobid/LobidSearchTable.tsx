import {Avatar, Divider, List, ListItem, ListItemAvatar, ListItemButton, ListItemText} from '@mui/material'
import React, {Fragment, FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react'

import {findEntityWithinLobid, findEntityWithinLobidByIRI} from '../../utils/lobid/findEntityWithinLobid'
import ClassicResultListItem from '../result/ClassicResultListItem'
import ClassicEntityCard from './ClassicEntityCard'
import LobidAllPropTable from "./LobidAllPropTable";
import {useLocalHistory} from "../../state";

type Props = {
  searchString: string,
  typeName?: string
  onSelect?: (id: string | undefined) => void,
  onAcceptItem?: (id: string | undefined, data: any) => void
}

type LobIDEntry = {
  id: string,
  [key: string]: any
}

const gndEntryWithMainInfo = (allProps: any) => {
  {
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
  }
}
const LobidSearchTable: FunctionComponent<Props> = ({
                                                      searchString,
                                                      typeName = 'Person',
                                                      onSelect,
                                                      onAcceptItem
                                                    }
) => {
  const [resultTable, setResultTable] = useState<LobIDEntry[] | undefined>()
  const {history, pushHistory, popHistory} = useLocalHistory()
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [selectedEntry, setSelectedEntry] = useState<LobIDEntry | undefined>()



  const fetchData = useCallback(
      async () => {
        if (!searchString || searchString.length < 1) return
        setResultTable(
            (await findEntityWithinLobid(searchString, typeName, 10))?.member?.map(
                (allProps: any) => gndEntryWithMainInfo(allProps) ))
      },
      [searchString, typeName],
  )

  const handleSelect = useCallback(
      async (id: string | undefined, push: boolean = true) => {
        setSelectedId(id)
        push && pushHistory(id)
        const cachedEntry =  id && resultTable?.find((entry) => entry.id === id)
        try {

          const entry = cachedEntry || id && gndEntryWithMainInfo(await findEntityWithinLobidByIRI(id))
          console.log({entry})
          if(!entry)  throw new Error('No entry found')
          setSelectedEntry(entry)
          onSelect && onSelect(id)
        } catch (e) {
          console.error('Error while fetching data from lobid', e)
          setSelectedEntry(undefined)
          onSelect && onSelect(undefined)
        }
      }, [setSelectedId, resultTable, setSelectedEntry, onSelect])


  useEffect(() => {
    fetchData()
  }, [searchString, typeName, fetchData])

  const handleAccept = useCallback(
      (id: string | undefined) => {
        onAcceptItem && onAcceptItem(id, selectedEntry)
      }, [onAcceptItem, selectedEntry, pushHistory])

  return <>{selectedId && <ClassicEntityCard
      id={selectedId}
      data={selectedEntry} onBack={() => handleSelect(undefined)}
      onSelectItem={handleSelect}
      onAcceptItem={(id) => onAcceptItem(id, selectedEntry)}
      detailView={<LobidAllPropTable allProps={selectedEntry.allProps} onEntityChange={handleSelect}/>}/>}
    <List>
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
                altAvatar={String(idx + 1)}/>
        )
      })
    }
  </List>
</>
}


export default LobidSearchTable
