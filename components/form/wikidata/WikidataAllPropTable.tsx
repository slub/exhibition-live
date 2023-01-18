import {Container, Table, TableBody, TableCell, TableContainer, TableRow} from '@mui/material'
import React, {FunctionComponent, useEffect, useState} from 'react'

import {CommonPropertyValues, getCommonPropsFromWikidata} from '../../utils/wikidata'

interface OwnProps {
  thingIRI?: string
}

type Props = OwnProps;

const WikidataAllPropTable: FunctionComponent<Props> = ({thingIRI}) => {
  const [allProps, setAllProps] = useState<CommonPropertyValues>({})
  useEffect(() => {
    if(!thingIRI) return
    getCommonPropsFromWikidata(`http://www.wikidata.org/entity/${thingIRI}`, ['https://query.wikidata.org/sparql'])
        .then(_allProps => {
          setAllProps(_allProps as CommonPropertyValues)
        })
  }, [thingIRI, setAllProps])

  return (
      <TableContainer component={Container}>
        <Table sx={{ minWidth: '100%' }} aria-label="custom table">
          <TableBody>
            {allProps && (Object.entries(allProps)).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell style={{ width: 100 }} component="th" scope="row">
                    {value.label}
                  </TableCell>
                  <TableCell  align="right">
                    {value.objects.map(v => {
                      if(v.termType !== 'Literal' && v?.uri) {
                        return <span key={v.uri}><a href={v.uri} target='_blank' referrerPolicy='no-referrer' rel="noreferrer" >{v.label}</a>, </span>
                      }
                      if(v.termType === 'Literal' ) {
                        return <span key={v.value}>{v.value}, </span>
                      }
                    })}
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>)
}

export default WikidataAllPropTable
