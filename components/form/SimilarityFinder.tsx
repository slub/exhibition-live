// @flow
import {Book as WikidataIcon, LinkedIn as GNDIcon, Storage as KnowledgebaseIcon} from '@mui/icons-material'
import {Grid, Icon, ToggleButton, ToggleButtonGroup, Tooltip} from '@mui/material'
import {JSONSchema7} from 'json-schema'
import Image from 'next/image'
import * as React from 'react'
import {FunctionComponent, useCallback, useState} from 'react'

import {BASE_IRI} from '../config'
import DiscoverSearchTable from './discover/DiscoverSearchTable'
import LobidSearchTable from './lobid/LobidSearchTable'

type Props = {
  data: any,
  classIRI: string
  jsonSchema: JSONSchema7
  onEntityChange?: (entityIRI: string | undefined) => void
};
type State = {};

type KnowledgeSources = 'kb' | 'gnd' | 'wikidata'
type SelectedEntity = {
  id: string
  source: KnowledgeSources
}
const SimilarityFinder: FunctionComponent<Props> = ({
                                                      data, classIRI, onEntityChange
                                                    }) => {
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<KnowledgeSources[]>(['kb', 'gnd', 'wikidata'])
  const [entitySelected, setEntitySelected] = useState<SelectedEntity | undefined>()

  const handleKnowledgeSourceChange = useCallback(
      (event: React.MouseEvent<HTMLElement>, newKnowledgeSources: KnowledgeSources[]) => {
        setSelectedKnowledgeSources(newKnowledgeSources)
      }, [setSelectedKnowledgeSources])
  const typeName = classIRI.substring(BASE_IRI.length, classIRI.length)
  const handleSelect = useCallback(
      (id: string | undefined, source: KnowledgeSources) => {
        setEntitySelected(id ? {id, source} : undefined)
      },
      [setEntitySelected],
  )
  return (<>
        <Grid container justifyContent="center">
          <Grid item>
            <Tooltip title={'Suche nach ähnlichen Einträgen in anderen Verzeichnis'}>
              <ToggleButtonGroup
                  value={selectedKnowledgeSources}
                  onChange={handleKnowledgeSourceChange}
                  aria-label="Suche über verschiedene Wissensquellen"
              >
                <ToggleButton value="kb" aria-label="left aligned">
                  <KnowledgebaseIcon/>
                </ToggleButton>
                <ToggleButton value="gnd" aria-label="centered">
                  <Image alt={'gnd logo'} width={24} height={24} src={'/Icons/gnd-logo.png'} />
                </ToggleButton>
                <ToggleButton value="wikidata" aria-label="right aligned">
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
                onAcceptItem={(id) => onEntityChange && onEntityChange(id)}
                onSelect={(id) => handleSelect(id, 'kb')}/> }
        {(!entitySelected || entitySelected.source == 'gnd') && selectedKnowledgeSources.includes('gnd') &&
          <LobidSearchTable searchString={data.name} typeName={typeName} onSelect={(id) => handleSelect(id, 'gnd')}/>}
      </>
  )
}

export default SimilarityFinder