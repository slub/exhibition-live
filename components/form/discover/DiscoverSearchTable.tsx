import {List} from '@mui/material'
import {FunctionComponent, useCallback, useEffect, useState} from 'react'

import {useGlobalCRUDOptions} from '../../state/useGlobalCRUDOptions'
import {useSettings} from '../../state/useLocalSettings'
import findEntityByClass from '../../utils/discover/findEntityByClass'
import {sladb} from '../formConfigs'
import ClassicEntityCard from '../lobid/ClassicEntityCard'
import ClassicResultListItem from '../result/ClassicResultListItem'

type Props = {
  searchString: string,
  typeName?: string
  classIRI?: string
  onSelect?: (id: string | undefined) => void
  onAcceptItem?: (id: string | undefined) => void
}

const DiscoverSearchTable: FunctionComponent<Props> = ({
                                                         searchString,
                                                         typeName = 'Person',
                                                         classIRI = sladb[typeName].value,
                                                         onSelect,
                                                         onAcceptItem
                                                       }
) => {
  const [resultTable, setResultTable] = useState<any | undefined>()
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [selectedEntry, setSelectedEntry] = useState<any | undefined>()
  const { crudOptions } = useGlobalCRUDOptions()

  const fetchData = useCallback(
      async () => {
        if (!searchString || searchString.length < 1 || !crudOptions) return
        setResultTable(
            (await findEntityByClass(searchString, classIRI, crudOptions.selectFetch))
                .map(({name = '', value}: {name: string, value: any}) => {
                  return {
                    label: name,
                    id: value as string
                  }
                }))
      },
      [searchString, classIRI, crudOptions]
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


  return (!selectedId ? <List>
    {
      // @ts-ignore
      resultTable?.map(({id, label, avatar, secondary}, idx) => {
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

  </List> : <ClassicEntityCard id={selectedId} data={selectedEntry} onBack={() => handleSelect(undefined)}
                               onAcceptItem={onAcceptItem}/>)
}


export default DiscoverSearchTable
