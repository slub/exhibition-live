import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Collapse,
  Container,
  Grid,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { wikidataPrefixes } from "@slub/edb-ui-utils";
import WikidataAllPropTable from "./WikidataAllPropTable";
import { sparqlSelectViaFieldMappings } from "@slub/sparql-schema";
import { remoteSparqlQuery } from "@slub/remote-query-implementations";

interface OwnProps {
  personIRI?: string | null;
}

type Props = OwnProps;

type PersonInfo = {
  label: string;
  description: string;
  occupation: string[];
  birthDate?: Date;
  deathDate?: Date;
  image?: string;
};

const WikidataHumanCard: FunctionComponent<Props> = ({ personIRI }) => {
  const [personData, setPersonData] = useState<PersonInfo | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = useCallback(() => {
    setExpanded((expanded) => !expanded);
  }, [setExpanded]);

  useEffect(() => {
    setPersonData(null);
    if (!personIRI) return;
    sparqlSelectViaFieldMappings(
      personIRI.startsWith("Q") ? `wd:${personIRI}` : `<${personIRI}>`,
      {
        fieldMapping: {
          occupation: {
            kind: "object",
            optional: true,
            type: "NamedNode",
            predicateURI: "wdt:P106",
          },
          birthDate: {
            kind: "literal",
            optional: true,
            type: "xsd:date",
            predicateURI: "wdt:P569",
            single: true,
          },
          deathDate: {
            kind: "literal",
            optional: true,
            type: "xsd:date",
            predicateURI: "wdt:P570",
            single: true,
          },
          image: {
            kind: "object",
            optional: true,
            type: "NamedNode",
            predicateURI: "wdt:P18",
            single: true,
          },
        },
        includeLabel: true,
        includeDescription: true,
        wrapAround: [
          `SERVICE wikibase:label {
              bd:serviceParam wikibase:language "en" .`,
          "}",
        ],
        prefixes: wikidataPrefixes,
        permissive: true,
        query: (sparqlSelect: string) =>
          remoteSparqlQuery(sparqlSelect, [
            "https://query.wikidata.org/sparql",
          ]),
      },
    ).then((_personInfo) => {
      setPersonData(_personInfo as PersonInfo);
    });
  }, [personIRI, setPersonData]);

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Card>
            {!personData ? (
              <Skeleton
                sx={{ height: 300 }}
                animation="wave"
                variant="rectangular"
              />
            ) : (
              <CardMedia
                component="img"
                alt={"Image of " + personData.label}
                height="300"
                {...(personData.image ? { image: personData.image } : {})}
              />
            )}
            <CardContent>
              {!personData ? (
                <>
                  <Skeleton
                    animation="wave"
                    height={10}
                    style={{ marginBottom: 6 }}
                  />
                  <Skeleton animation="wave" height={10} width="80%" />
                </>
              ) : (
                <>
                  <Typography gutterBottom variant="h5" component="div">
                    {personData.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {personData.description}
                  </Typography>
                  <TableContainer component={Container}>
                    <Table
                      sx={{ minWidth: "100%" }}
                      aria-label="custom pagination table"
                    >
                      <TableBody>
                        {[
                          {
                            label: "birth date",
                            value: personData.birthDate || "",
                          },
                          {
                            label: "death date",
                            value: personData.deathDate || "",
                          },
                        ].map((row) => (
                          <TableRow key={row.label}>
                            <TableCell component="th" scope="row">
                              {row.label}
                            </TableCell>
                            <TableCell style={{ width: 160 }} align="right">
                              {dayjs(row.value).toString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </CardContent>
            <CardActions>
              <Button size="small">Copy</Button>
              <Button size="small" onClick={handleExpandClick}>
                Learn More
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={8}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            {expanded && personIRI ? (
              <WikidataAllPropTable thingIRI={personIRI} />
            ) : null}
          </Collapse>
        </Grid>
      </Grid>
    </div>
  );
};

export default WikidataHumanCard;
