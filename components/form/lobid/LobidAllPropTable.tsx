import {Container, Link, Table, TableBody, TableCell, TableContainer, TableRow} from '@mui/material'
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react'
import uri from 'refractor/lang/uri'

import {gndBaseIRI} from '../../utils/gnd/prefixes'

interface OwnProps {
  allProps?: any[],
  onEntityChange?: (uri: string) => void
}

type Props = OwnProps;

const camelCaseToTitleCase = (str: string) => {
  return str.replace(/([A-Z])/g, ' $1')
      .replace(/^./, function(str){ return str.toUpperCase() })
}

const LabledLink = ({uri, label, onClick} : {uri: string, label?: string, onClick?: () => void }) => {
  const urlSuffix = useMemo(() => uri.substring( ( (uri.includes('#') ? uri.lastIndexOf('#')  : uri.lastIndexOf('/')) + 1 )?? 0, uri.length ), [uri])
  return uri.startsWith(gndBaseIRI) ?  <Link onClick={onClick} component='button' >{label || urlSuffix}</Link> : <Link target='_blank' href={uri}>{label || urlSuffix}</Link>
}
const LobidAllPropTable: FunctionComponent<Props> = ({allProps, onEntityChange}) => {

  const handleClickEntry = useCallback(
      ({id}: {id: string}) => {
        onEntityChange && onEntityChange(id)
      },
      [onEntityChange, uri],
  )

  return (<TableContainer component={Container}>
        <Table sx={{ minWidth: '100%' }} aria-label="custom table">
          <TableBody>
            {allProps && (Object.entries(allProps))
                .filter(([key, value]) => !key.startsWith('@') && (
                    typeof value === 'string' || Array.isArray(value) && value.length > 0
                ) )
                .map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell style={{ width: 100 }} component="th" scope="row">
                    {camelCaseToTitleCase(key)}
                  </TableCell>
                  <TableCell  align="right">
                    {Array.isArray(value) && value.map((v, index) => {
                      if(typeof v === 'string' ) {
                        return <span key={v}>{v}, </span>
                      }
                      if(typeof v.id === 'string') {
                        return <span key={v.id}><LabledLink uri={v.id} label={v.label} onClick={() => handleClickEntry(v)} />{index < value.length -1 ? ',' : ''} </span>
                      }
                    }) || (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' && value)}
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>)
}

export default LobidAllPropTable
