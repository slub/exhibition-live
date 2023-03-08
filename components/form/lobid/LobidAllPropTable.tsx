import {Container, Table, TableBody, TableCell, TableContainer, TableRow} from '@mui/material'
import React, {FunctionComponent, useEffect, useState} from 'react'

import {CommonPropertyValues, getCommonPropsFromWikidata} from '../../utils/wikidata'

interface OwnProps {
  allProps?: any[]
}

type Props = OwnProps;

const camelCaseToTitleCase = (str: string) => {
  return str.replace(/([A-Z])/g, ' $1')
      .replace(/^./, function(str){ return str.toUpperCase() })
}

const LobidAllPropTable: FunctionComponent<Props> = ({allProps}) => {

  return (
      <TableContainer component={Container}>
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
                    {Array.isArray(value) && value.map(v => {
                      if(typeof v === 'string' ) {
                        return <span key={v}>{v}, </span>
                      }
                      if(typeof v.id === 'string') {
                        return <span key={v.id}><a href={v.id} target='_blank' referrerPolicy='no-referrer' rel="noreferrer" >{v.label}</a>, </span>
                      }
                    }) || typeof value === 'string' && value}
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>)
}

export default LobidAllPropTable
