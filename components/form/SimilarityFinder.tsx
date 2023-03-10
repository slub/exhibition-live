// @flow
import {Book as WikidataIcon, LinkedIn as GNDIcon, Storage as KnowledgebaseIcon} from '@mui/icons-material'
import {Grid, Icon, ToggleButton, ToggleButtonGroup, Tooltip} from '@mui/material'
import {JSONSchema7} from 'json-schema'
import Image from 'next/image'
import * as React from 'react'
import {FunctionComponent, useCallback, useMemo,useState} from 'react'

import {BASE_IRI} from '../config'
import {gndFieldsToOwnModelMap} from '../config/lobidMappings'
import {mapGNDToModel} from '../utils/gnd/mapGNDToModel'
import DiscoverSearchTable from './discover/DiscoverSearchTable'
import LobidSearchTable from './lobid/LobidSearchTable'

type Props = {
  data: any,
  classIRI: string
  jsonSchema: JSONSchema7
  onEntityIRIChange?: (entityIRI: string | undefined) => void
  onMappedDataAccepted?: (data: any) => void
};
type State = {};

type KnowledgeSources = 'kb' | 'gnd' | 'wikidata'
type SelectedEntity = {
  id: string
  source: KnowledgeSources
}
const SimilarityFinder: FunctionComponent<Props> = ({
                                                      data, classIRI, onEntityIRIChange, onMappedDataAccepted
                                                    }) => {
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<KnowledgeSources[]>(['kb', 'gnd', 'wikidata'])
  const [entitySelected, setEntitySelected] = useState<SelectedEntity | undefined>()

  const handleKnowledgeSourceChange = useCallback(
      (event: React.MouseEvent<HTMLElement>, newKnowledgeSources: KnowledgeSources[]) => {
        setSelectedKnowledgeSources(newKnowledgeSources)
      }, [setSelectedKnowledgeSources])
  const typeName = useMemo(() => classIRI.substring(BASE_IRI.length, classIRI.length), [classIRI])
  const handleSelect = useCallback(
      (id: string | undefined, source: KnowledgeSources) => {
        setEntitySelected(id ? {id, source} : undefined)
      },
      [setEntitySelected],
  )

  const handleAccept = useCallback(
      (id: string | undefined, entryData: any) => {
        if(!id || ! entryData?.allProps) return
        const newData = mapGNDToModel(typeName, entryData.allProps, gndFieldsToOwnModelMap)
        newData['gnd'] = { '@id': id }
        onMappedDataAccepted && onMappedDataAccepted(newData)


      },
      [selectedKnowledgeSources, typeName, onMappedDataAccepted])

  const handleEntityChange = useCallback(
      (id: string |  undefined) => {
        onEntityIRIChange && onEntityIRIChange(id)
      }, [onEntityIRIChange])

  return (<>
        <Grid container justifyContent="center">
          <Grid item>
            <Tooltip title={'Suche nach ähnlichen Einträgen in anderen Verzeichnis'}>
              <ToggleButtonGroup
                  value={selectedKnowledgeSources}
                  onChange={handleKnowledgeSourceChange}
                  aria-label="Suche über verschiedene Wissensquellen"
              >
                <ToggleButton value="kb" aria-label="lokale Datenbank">
                  <KnowledgebaseIcon/>
                </ToggleButton>
                <ToggleButton value="gnd" aria-label="GND">
                  <Image alt={'gnd logo'} width={24} height={24} src={'/Icons/gnd-logo.png'} />
                </ToggleButton>
                <ToggleButton value="wikidata" aria-label="Wikidata">
                  <Image alt={'wikidata logo'} width={30} height={24} src={'/Icons/Wikidata-logo-en.svg'} />
                </ToggleButton>
              </ToggleButtonGroup>

            </Tooltip>
          </Grid>
        </Grid>
        {(!entitySelected || entitySelected.source == 'kb') && selectedKnowledgeSources.includes('kb') &&
            <DiscoverSearchTable
                searchString={data.name}
                typeName={typeName}
                classIRI={classIRI}
                onAcceptItem={handleEntityChange}
                onSelect={(id) => handleSelect(id, 'kb')}/> }
        {(!entitySelected || entitySelected.source == 'gnd') && selectedKnowledgeSources.includes('gnd') &&
          <LobidSearchTable
              onAcceptItem={handleAccept}
              searchString={data.name}
              typeName={typeName}
              onSelect={(id) => handleSelect(id, 'gnd')}/>}
      </>
  )
}

export default SimilarityFinder
