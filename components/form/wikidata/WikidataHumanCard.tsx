import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia, Collapse, Container,
  Grid,
  Paper,
  Table, TableBody, TableCell,
  TableContainer, TableRow,
  Typography
} from '@mui/material'
import dayjs from 'dayjs'
import React, {FunctionComponent, useCallback, useEffect, useState} from 'react'

import {sparqlSelectViaFieldMappings} from '../../utils/sparql'
import {getCommonPropsFromWikidata, wikidataPrefixes} from '../../utils/wikidata'
import WikidataAllPropTable from './WikidataAllPropTable'

interface OwnProps {
  personIRI?: string | null
}

type Props = OwnProps;

type PersonInfo = {
  label: string
  description: string
  occupation: string[]
  birthDate?: Date
  deathDate?: Date
  image?: string
}

const WikidataHumanCard: FunctionComponent<Props> = ({personIRI}) => {
  const [personData, setPersonData] = useState<PersonInfo | null>(null)
  const [expanded, setExpanded] = React.useState(false)

  const handleExpandClick = useCallback(
      () => {
        setExpanded(expanded => !expanded)
      }, [setExpanded])

  useEffect(() => {
    if(!personIRI)
      return
    console.log('Will query person Info', personIRI)
    sparqlSelectViaFieldMappings(`wd:${personIRI}`, {
      fieldMapping: {
        occupation: {kind: 'object', optional: true, type: 'NamedNode', predicateURI: 'wdt:P106'},
        birthDate: {kind: 'literal', optional: true, type: 'xsd:date', predicateURI: 'wdt:P569', single: true},
        deathDate: {kind: 'literal', optional: true, type: 'xsd:date', predicateURI: 'wdt:P570', single: true},
        image: {kind: 'object', optional: true, type: 'NamedNode', predicateURI: 'wdt:P18', single: true}
      },
      includeLabel: true,
      includeDescription: true,
      wrapAround: [
        `SERVICE wikibase:label {
              bd:serviceParam wikibase:language "en" .`, '}'],
      prefixes: wikidataPrefixes,
      permissive: true,
      sources: ['https://query.wikidata.org/sparql']
    }).then(_personInfo => {
      setPersonData(_personInfo as PersonInfo)
    })
  }, [personIRI, setPersonData])

  return personData ? <div>
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <Card >
          <CardMedia
              component="img"
              alt={'Image of ' + personData.label}
              height="300"
              {...(personData.image ? {image: personData.image} : {})}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {personData.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {personData.description}
            </Typography>
            <TableContainer component={Container}>
              <Table sx={{ minWidth: '100%' }} aria-label="custom pagination table">
                <TableBody>
                  {([
                    {label: 'birth date', value: personData.birthDate || ''},
                    {label: 'death date', value: personData.deathDate || ''}
                  ]).map((row) => (
                      <TableRow key={row.label}>
                        <TableCell component="th" scope="row">
                          {row.label}
                        </TableCell>
                        <TableCell style={{ width: 160 }} align="right">
                          {dayjs( row.value ).toString()}
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
          <CardActions>
            <Button size="small">Copy</Button>
            <Button size="small" onClick={handleExpandClick}>Learn More</Button>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={8}>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
            {expanded && personIRI ? <WikidataAllPropTable thingIRI={personIRI} /> : null }
        </Collapse>
      </Grid>
    </Grid>
  </div> : <div>Blubb</div>



}


export default WikidataHumanCard
