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
} from "../utils/graph/jsonSchemaGraphInfuser";
import { addressSchema } from "../../fixtures/schema";
import { bringDefinitionToTop } from "../utils/core";

type Props = WalkerOptions;

const schema = bringDefinitionToTop(addressSchema, "Person");

async function sampleDataset() {
  //const filename = path.join(path.dirname(require.resolve('tbbt-ld')), 'dist/tbbt.nq')
  const input = await fetch("http://localhost:4002/tbbt.nq").then((t) =>
    t.text(),
  );
  const parser = new N3Parser();
  return dsExt.fromStream(
    datasetFactory.dataset(),
    parser.import(stringToStream(input)),
  );
}

const baseIRI = "http://schema.org/";
const DeepGraphToJSONShowcase: FunctionComponent<Props> = ({
  omitEmptyObjects,
  omitEmptyArrays,
  maxRecursionEachRef,
  maxRecursion,
  skipAtLevel = 0,
}) => {
  const [jsonFromGraph, setJsonFromGraph] = useState<any>({});
  const [dataset, setDataset] = useState<Dataset | null>(null);

  useEffect(() => {
    sampleDataset().then((ds) => setDataset(ds as Dataset));
  }, [setDataset]);

  useEffect(() => {
    if (dataset) {
      console.log(dataset.size);
      const resultJSON = jsonSchemaGraphInfuser(
        baseIRI,
        "http://localhost:8080/data/person/leonard-hofstadter",
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
    dataset,
    setJsonFromGraph,
    omitEmptyArrays,
    omitEmptyObjects,
    maxRecursionEachRef,
    maxRecursion,
  ]);

  return (
    <>
      <JsonView data={schema} shouldInitiallyExpand={(lvl) => lvl < 5} />
      <hr />
      <JsonView
        data={jsonFromGraph}
        shouldInitiallyExpand={(lvl) => lvl < 10}
      />
    </>
  );
};

export default DeepGraphToJSONShowcase;
