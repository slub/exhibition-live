import "react-json-view-lite/dist/index.css";

import datasetFactory from "@rdfjs/dataset";
import N3Parser from "@rdfjs/parser-n3";
import { Dataset } from "@rdfjs/types";
import { JSONSchema7 } from "json-schema";
import dsExt from "rdf-dataset-ext";
import React, { FunctionComponent, useEffect, useState } from "react";
import { JsonView } from "react-json-view-lite";
import stringToStream from "string-to-stream";

import {
  jsonSchemaGraphInfuser,
  WalkerOptions,
} from "../../utils/graph/jsonSchemaGraphInfuser";
import { addressSchema } from "../../../fixtures/schema";
import { bringDefinitionToTop } from "../../utils/core";
// @ts-ignore
import tbbt from "tbbt-ld/dist/tbbt.nq";
import {Grid, Typography} from "@mui/material";

type EntityIRIs = "http://localhost:8080/data/person/leonard-hofstadter" | "http://localhost:8080/data/person/mary-cooper" | "http://localhost:8080/data/person/bernadette-rostenkowski" | "http://localhost:8080/data/person/amy-farrah-fowler" | "http://localhost:8080/data/person/penny" | "http://localhost:8080/data/person/sheldon-cooper" | "http://localhost:8080/data/person/howard-wolowitz" | "http://localhost:8080/data/person/rajesh-koothrappali";
type OwnProps = {
  entityIRI: EntityIRIs;
  baseIRI: string;
}

type Props = OwnProps & WalkerOptions;

const schema = bringDefinitionToTop(addressSchema, "Person");

async function sampleDataset() {
  //const filename = path.join(path.dirname(require.resolve('tbbt-ld')), 'dist/tbbt.nq')
  const input = await fetch(tbbt).then((t) =>
    t.text(),
  );
  const parser = new N3Parser();
  return {
    raw: input,
    ds: await dsExt.fromStream(
      datasetFactory.dataset(),
      parser.import(stringToStream(input)),
  )};
}

const DeepGraphToJSONShowcase: FunctionComponent<Props> = ({
  entityIRI,
  baseIRI,
  omitEmptyObjects,
  omitEmptyArrays,
  maxRecursionEachRef,
  maxRecursion,
  skipAtLevel = 0,
}) => {
  const [jsonFromGraph, setJsonFromGraph] = useState<any>({});
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [rawTriples, setRawTriples] = useState("")

  useEffect(() => {
    sampleDataset().then(({ds, raw}) => {
      setDataset(ds as Dataset);
      setRawTriples(raw);
    });
  }, [setDataset, setRawTriples]);

  useEffect(() => {
    if (dataset) {
      const resultJSON = jsonSchemaGraphInfuser(
        baseIRI,
        entityIRI,
        dataset as Dataset,
        schema as JSONSchema7,
        {
          omitEmptyArrays,
          omitEmptyObjects,
          maxRecursionEachRef,
          maxRecursion,
          skipAtLevel,
        },
      );
      setJsonFromGraph(resultJSON);
    }
  }, [
    baseIRI,
    entityIRI,
    dataset,
    setJsonFromGraph,
    omitEmptyArrays,
    omitEmptyObjects,
    maxRecursionEachRef,
    maxRecursion,
    skipAtLevel,
  ]);

  return (
    <Grid container direction={"row"} wrap={"nowrap"} justifyContent={"center"}>
      <Grid item flex={1} sx={{maxHeight: "70vh", overflow: "auto"}}>
      <Typography variant={"h5"}>Schema</Typography>
      <JsonView data={schema} shouldInitiallyExpand={(lvl) => lvl < 5} />
      </Grid>
      <Grid item flex={1}  sx={{maxHeight: "70vh", overflow: "auto"}}>
      <Typography variant={"h5"}>Dataset</Typography>
        <code>
          <pre>{rawTriples}</pre>
        </code>
      </Grid>
      <Grid item flex={1} sx={{maxHeight: "70vh", overflow: "auto"}}>
      <Typography variant={"h5"}>extracted JSON</Typography>
      <JsonView
        data={jsonFromGraph}
        shouldInitiallyExpand={(lvl) => lvl < 10}
      />
      </Grid>
    </Grid>
  );
};

export default DeepGraphToJSONShowcase;
