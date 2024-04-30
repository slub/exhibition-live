import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Collapse,
  Grid,
  Typography,
} from "@mui/material";
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
  thingIRI?: string | null;
}

type Props = OwnProps;

type ThingInfo = {
  label: string;
  description: string;
  image?: string;
};

const WikidataThingCard: FunctionComponent<Props> = ({ thingIRI }) => {
  const [thingData, setThingData] = useState<ThingInfo | null>(null);
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = useCallback(() => {
    setExpanded((expanded) => !expanded);
  }, [setExpanded]);

  useEffect(() => {
    if (!thingIRI) return;
    sparqlSelectViaFieldMappings(
      thingIRI.startsWith("Q") ? `wd:${thingIRI}` : `<${thingIRI}>`,
      {
        fieldMapping: {
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
    ).then((_info) => {
      setThingData(_info as ThingInfo);
    });
  }, [thingIRI, setThingData]);

  return thingData ? (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Card>
            <CardMedia
              component="img"
              alt={"Image of " + thingData.label}
              height="300"
              {...(thingData.image ? { image: thingData.image } : {})}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {thingData.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {thingData.description}
              </Typography>
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
            {expanded && thingIRI ? (
              <WikidataAllPropTable thingIRI={thingIRI} />
            ) : null}
          </Collapse>
        </Grid>
      </Grid>
    </div>
  ) : (
    <div>Blubb</div>
  );
};

export default WikidataThingCard;
